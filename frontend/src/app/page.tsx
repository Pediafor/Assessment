export default function HomePage() {export default function HomePage() {

  return (  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">

      <div className="max-w-4xl mx-auto text-center px-4">      <div className="text-center">

        <h1 className="text-6xl font-bold text-gray-900 mb-6">        <h1 className="text-4xl font-bold text-gray-900 mb-4">

          Assessment Platform          🎉 Pediafor Assessment Platform

        </h1>        </h1>

        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">        <p className="text-xl text-gray-600 mb-8">

          A comprehensive platform for creating, managing, and taking assessments.           Frontend is running successfully!

          Built with modern technologies for students, teachers, and administrators.        </p>

        </p>        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">

                  <h2 className="text-2xl font-semibold text-green-600 mb-4">✅ Status: Operational</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">          <ul className="text-left space-y-2">

          <div className="bg-white rounded-lg p-8 shadow-lg">            <li>✅ Next.js 14 with App Router</li>

            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">            <li>✅ TypeScript configuration</li>

              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">            <li>✅ Tailwind CSS styling</li>

                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />            <li>✅ Development server running</li>

              </svg>          </ul>

            </div>        </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">For Students</h3>      </div>

            <p className="text-gray-600">Take assessments, view results, and track your learning progress.</p>    </div>

          </div>  );

          }
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">For Teachers</h3>
            <p className="text-gray-600">Create assessments, grade submissions, and monitor student performance.</p>
          </div>
          
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">For Administrators</h3>
            <p className="text-gray-600">Manage users, oversee platform operations, and configure system settings.</p>
          </div>
        </div>
        
        <div className="mt-12">
          <div className="bg-white rounded-lg p-6 shadow-lg inline-block">
            <p className="text-sm text-gray-500 mb-4">Platform Status</p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">API Gateway</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">User Service</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Assessment Service</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Frontend</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}