import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const appointmentData = await req.json();

    // Validate required fields
    const requiredFields = ['business_id', 'service_id', 'appointment_date', 'start_time', 'end_time', 'customer_name', 'customer_phone'];
    for (const field of requiredFields) {
      if (!appointmentData[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check for conflicts atomically using the RPC
    const { data: hasConflict, error: conflictError } = await supabaseClient.rpc('is_timeslot_conflicting', {
      p_business_id: appointmentData.business_id,
      p_service_id: appointmentData.service_id,
      p_appointment_date: appointmentData.appointment_date,
      p_start_time: appointmentData.start_time,
      p_end_time: appointmentData.end_time,
      p_staff_id: appointmentData.staff_id || null,
      p_exclude_appointment_id: null
    });

    if (conflictError) {
      console.error('Error checking conflict:', conflictError);
      return new Response(
        JSON.stringify({ error: 'Failed to check availability' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (hasConflict) {
      return new Response(
        JSON.stringify({ error: 'Time slot is no longer available' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert appointment with customer_id = auth.uid() (RLS will enforce this)
    const { data: appointment, error: insertError } = await supabaseClient
      .from('appointments')
      .insert({
        ...appointmentData,
        customer_id: user.id,
        status: 'pending'
      })
      .select(`
        id, 
        appointment_date, 
        start_time, 
        end_time, 
        status,
        customer_name,
        customer_email,
        customer_phone,
        notes,
        business_id,
        service_id
      `)
      .single();

    if (insertError) {
      console.error('Error creating appointment:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create appointment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch business and service details for email notifications
    const { data: business } = await supabaseClient
      .from('businesses')
      .select('name, phone, email, owner_id')
      .eq('id', appointment.business_id)
      .single();

    const { data: service } = await supabaseClient
      .from('services')
      .select('name, price')
      .eq('id', appointment.service_id)
      .single();

    // Send confirmation email to customer (don't await - fire and forget)
    if (appointment.customer_email && business && service) {
      supabaseClient.functions.invoke('send-booking-confirmation', {
        body: {
          appointmentId: appointment.id,
          customerEmail: appointment.customer_email,
          customerName: appointment.customer_name,
          businessName: business.name,
          serviceName: service.name,
          appointmentDate: appointment.appointment_date,
          startTime: appointment.start_time,
          endTime: appointment.end_time,
          price: service.price,
          businessPhone: business.phone,
          notes: appointment.notes
        }
      }).catch(err => console.error('Failed to send customer confirmation:', err));
    }

    // Send notification email to business owner (don't await - fire and forget)
    if (business?.email && service) {
      supabaseClient.functions.invoke('send-owner-notification', {
        body: {
          appointmentId: appointment.id,
          ownerEmail: business.email,
          customerName: appointment.customer_name,
          customerPhone: appointment.customer_phone,
          customerEmail: appointment.customer_email,
          businessName: business.name,
          serviceName: service.name,
          appointmentDate: appointment.appointment_date,
          startTime: appointment.start_time,
          endTime: appointment.end_time,
          price: service.price,
          notes: appointment.notes
        }
      }).catch(err => console.error('Failed to send owner notification:', err));
    }

    // Return minimal fields only
    return new Response(
      JSON.stringify({ 
        success: true,
        appointment: {
          id: appointment.id,
          appointment_date: appointment.appointment_date,
          start_time: appointment.start_time,
          end_time: appointment.end_time,
          status: appointment.status
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in book-appointment:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
