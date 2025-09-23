
import { useParams } from "react-router-dom";
import PublicBooking from "@/components/PublicBooking";

const BookingPage = () => {
  const { businessLink } = useParams<{ businessLink: string }>();

  // Decode the business link in case it contains encoded characters
  const decodedBusinessLink = businessLink ? decodeURIComponent(businessLink) : null;

  if (!decodedBusinessLink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Booking Link</h1>
          <p className="text-slate-400">The booking link you used is not valid.</p>
        </div>
      </div>
    );
  }

  return <PublicBooking businessLink={decodedBusinessLink} />;
};

export default BookingPage;
