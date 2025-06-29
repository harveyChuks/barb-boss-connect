
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId } = await req.json();
    
    if (!appointmentId) {
      throw new Error("Appointment ID is required");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get appointment details with service info
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        service:services!inner(name, price, duration_minutes)
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      throw new Error("Appointment not found");
    }

    // Calculate deposit amount (50% of service price)
    const servicePrice = appointment.service.price || 0;
    const depositAmount = Math.round(servicePrice * 0.5 * 100); // Convert to cents

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount,
      currency: "usd",
      metadata: {
        appointment_id: appointmentId,
        service_name: appointment.service.name,
        customer_name: appointment.customer_name,
        customer_email: appointment.customer_email || "",
      },
    });

    // Update appointment with payment intent ID and deposit amount
    await supabaseClient
      .from('appointments')
      .update({
        payment_intent_id: paymentIntent.id,
        deposit_amount: depositAmount / 100, // Store as dollars
      })
      .eq('id', appointmentId);

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        amount: depositAmount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
