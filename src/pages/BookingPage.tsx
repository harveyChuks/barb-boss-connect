
import { useParams } from "react-router-dom";
import PublicBooking from "@/components/PublicBooking";

const BookingPage = () => {
  const { businessLink } = useParams<{ businessLink: string }>();

  if (!businessLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Booking Link</h1>
          <p className="text-slate-400">The booking link you used is not valid.</p>
        </div>
      </div>
    );
  }

  return <PublicBooking businessLink={businessLink} />;
};

export default BookingPage;
