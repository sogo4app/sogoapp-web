import AppLanding from "../../../components/AppLanding";

export const metadata = {
  title: "Live on SogoApp",
  description: "Open in SogoApp to watch this live stream.",
};

export default function LivePage({ params }) {
  return (
    <AppLanding
      kicker="Live Stream"
      title="Someone is live on SogoApp"
      subtitle="Open the app to watch the stream."
      meta={[]}
      deepLink={`sogo://live/${params.id}`}
    />
  );
}
