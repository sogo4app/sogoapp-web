// Apple Universal Links — must be served at /.well-known/apple-app-site-association
// with NO file extension and an application/json content type. With this in place,
// iOS devices with SogoApp installed open /training/*, /live/* and /invite/* links
// directly in the app instead of the browser.
export const dynamic = "force-static";

const AASA = {
  applinks: {
    apps: [],
    details: [
      {
        appID: "VMD48Q7N3N.com.org.sogo",
        paths: ["/training/*", "/live/*", "/invite/*"],
      },
    ],
  },
};

export async function GET() {
  return new Response(JSON.stringify(AASA), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
