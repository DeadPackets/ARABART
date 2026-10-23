// Old addresses move here for good: projects.deadpackets.pw/ARABART/* (GitHub Pages until October 2026) and the
// /DOSArchive/* name before it. Path and query are kept, so old links and search rankings carry over.
export default {
  fetch(request, env) {
    const url = new URL(request.url);
    const old = /^\/(ARABART|DOSArchive)(?=\/|$)/.exec(url.pathname);
    // the pattern match may ignore case; /arabart/ is a page here and must not redirect
    if (!old) return env.ASSETS.fetch(request);
    return Response.redirect(`https://arabart.deadpackets.pw${url.pathname.slice(old[0].length) || '/'}${url.search}`, 301);
  },
};
