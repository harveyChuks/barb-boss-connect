
import { useParams } from "react-router-dom";
import PublicBooking from "@/components/PublicBooking";

const BookingPage = () => {
  const { businessLink } = useParams<{ businessLink: string }>();

  console.log('BookingPage - businessLink from URL:', businessLink);
  console.log('BookingPage - Current URL:', window.location.href);
  console.log('BookingPage - Current pathname:', window.location.pathname);

  if (!businessLink) {
    console.log('BookingPage - No businessLink found in URL params');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Booking Link</h1>
          <p className="text-slate-400">The booking link you used is not valid.</p>
        </div>
      </div>
    );
  }

  console.log('BookingPage - Rendering PublicBooking with businessLink:', businessLink);
  return <PublicBooking businessLink={businessLink} />;
};

export default BookingPage;
