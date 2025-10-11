import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId, action, newDate, newStartTime, newEndTime, reason } = await req.json();
    
    console.log("Processing booking action:", { appointmentId, action });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === "cancel") {
      const { error } = await supabase
        .from("appointments")
        .update({ 
          status: "cancelled",
          cancellation_reason: reason || "Cancelled by customer",
          cancelled_at: new Date().toISOString()
        })
        .eq("id", appointmentId);

      if (error) throw error;

      // Log the modification
      await supabase
        .from("appointment_modifications")
        .insert({
          appointment_id: appointmentId,
          modification_type: "cancelled",
          modified_by: "customer",
          old_status: "pending",
          new_status: "cancelled",
          reason: reason || "Cancelled by customer"
        });

      return new Response(
        JSON.stringify({ success: true, message: "Booking cancelled successfully" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else if (action === "reschedule") {
      // Get current appointment details
      const { data: currentAppointment, error: fetchError } = await supabase
        .from("appointments")
        .select("appointment_date, start_time, end_time")
        .eq("id", appointmentId)
        .single();

      if (fetchError) throw fetchError;

      // Update appointment with new time
      const { error: updateError } = await supabase
        .from("appointments")
        .update({
          appointment_date: newDate,
          start_time: newStartTime,
          end_time: newEndTime
        })
        .eq("id", appointmentId);

      if (updateError) throw updateError;

      // Log the modification
      await supabase
        .from("appointment_modifications")
        .insert({
          appointment_id: appointmentId,
          modification_type: "rescheduled",
          modified_by: "customer",
          old_date: currentAppointment.appointment_date,
          old_start_time: currentAppointment.start_time,
          old_end_time: currentAppointment.end_time,
          new_date: newDate,
          new_start_time: newStartTime,
          new_end_time: newEndTime,
          reason: reason || "Rescheduled by customer"
        });

      return new Response(
        JSON.stringify({ success: true, message: "Booking rescheduled successfully" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      throw new Error("Invalid action");
    }
  } catch (error: any) {
    console.error("Error handling booking action:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
