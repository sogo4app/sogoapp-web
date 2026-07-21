import AppLanding from "../components/AppLanding";

export const metadata = {
  title: "SogoApp — Messaging, calls, live streams & trainings",
  description:
    "SogoApp is a private messenger with HD calls, live streaming and paid live trainings.",
};

export default function Home() {
  return (
    <AppLanding
      kicker={null}
      title="Messaging, calls, live streams & trainings"
      subtitle="Private conversations, HD group calls, live streaming and paid trainings — all in one app."
      meta={[]}
      deepLink="sogo://"
    />
  );
}
