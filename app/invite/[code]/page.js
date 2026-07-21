import AppLanding from "../../../components/AppLanding";

export const metadata = {
  title: "Join SogoApp",
  description: "You've been invited to SogoApp.",
};

export default function InvitePage({ params }) {
  return (
    <AppLanding
      kicker="Invitation"
      title="You've been invited to SogoApp"
      subtitle="Open the app to accept the invitation."
      meta={[]}
      deepLink={`sogo://invite/${params.code}`}
    />
  );
}
