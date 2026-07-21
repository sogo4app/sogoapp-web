import AppLanding from "../../../components/AppLanding";

const API_BASE = "https://api.sogoapps.com/api/v1";

/**
 * Best-effort fetch of public training metadata. The backend endpoint may not
 * exist yet — every failure path (404, 5xx, timeout, bad JSON) degrades to the
 * generic invite card so shared links NEVER break.
 */
async function fetchTraining(id) {
  if (!/^\d{1,12}$/.test(id)) return null;
  try {
    const res = await fetch(`${API_BASE}/public/training/${id}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body?.data || null;
  } catch {
    return null;
  }
}

function priceLabel(t) {
  if (typeof t?.priceCents === "number") {
    return t.priceCents === 0 ? "Free" : `$${(t.priceCents / 100).toFixed(2)}`;
  }
  if (typeof t?.priceCoins === "number") {
    return t.priceCoins === 0 ? "Free" : `${t.priceCoins.toLocaleString()} coins`;
  }
  return null;
}

export async function generateMetadata({ params }) {
  const t = await fetchTraining(params.id);
  const title = t?.title
    ? `${t.title} — Live training on SogoApp`
    : "You're invited to a live training on SogoApp";
  const description = t?.hostName
    ? `Hosted by ${t.hostName}. Open in SogoApp to join.`
    : "Open in SogoApp to join this live training.";
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary", title, description },
  };
}

export default async function TrainingPage({ params }) {
  const { id } = params;
  const t = await fetchTraining(id);

  const meta = [];
  if (t?.hostName) meta.push({ k: "Host", v: t.hostName });
  if (t?.sessionCount) meta.push({ k: "Sessions", v: String(t.sessionCount) });
  const price = priceLabel(t);
  if (price) meta.push({ k: "Price", v: price });
  if (t?.startsAt) {
    const d = new Date(t.startsAt);
    if (!isNaN(d.getTime())) {
      meta.push({
        k: "Starts",
        v: d.toLocaleString("en-US", {
          month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
        }),
      });
    }
  }

  return (
    <AppLanding
      kicker="Live Training"
      title={t?.title || "You're invited to a live training"}
      subtitle={
        t?.title
          ? "Join this training in the SogoApp app."
          : "Open SogoApp to see the details and join."
      }
      meta={meta}
      deepLink={`sogo://training/${id}`}
    />
  );
}
