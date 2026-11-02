import createMiddleware from "next-intl/middleware"

import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  // /admin is the staff editor: Italian only, with its own root layout.
  matcher: "/((?!api|admin|_next|_vercel|.*\\..*).*)",
}
