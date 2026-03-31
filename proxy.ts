import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function proxy(req) {
        const role = req.nextauth.token?.role as string
        const path = req.nextUrl.pathname

        if (path.startsWith('/admin') && role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }

        if ((path.startsWith('/supervisor') || path.startsWith('/supervisor-dashboard')) && !['SUPERVISOR', 'ADMIN'].includes(role)) {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }

        if (path.startsWith('/trainee-dashboard') && !['TRAINEE', 'SUPERVISOR', 'ADMIN'].includes(role)) {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }

        if (path.startsWith('/client-dashboard') && !['CLIENT', 'ADMIN'].includes(role)) {
            return NextResponse.redirect(new URL('/unauthorized', req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
)

export const config = {
    matcher: [
        '/admin/:path*',
        '/supervisor/:path*',
        '/supervisor-dashboard/:path*',
        '/client-dashboard/:path*',
        '/trainee-dashboard/:path*',
        '/api/admin/:path*',
        '/api/supervisor/:path*'
    ]
}
