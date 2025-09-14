import React from 'react';
import { 
    ChartBarIcon, 
    UserGroupIcon, 
    CogIcon, 
    CloudIcon,
    ShieldCheckIcon,
    DevicePhoneMobileIcon,
    ServerIcon,
    ChatBubbleLeftRightIcon,
    ChartPieIcon,
    WrenchScrewdriverIcon,
    GlobeAltIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const LandingPage = ({ onLoginClick }) => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Reimagine Employee Experience,
                            <span className="text-blue-600 block">Redefine HR Success</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
                            Transform your HR operations across all touchpoints of employee experience with our comprehensive 
                            digital HRMS solutions. We help you reimagine workflows, enhance employee engagement, and drive 
                            measurable impact through cutting-edge technology.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={onLoginClick}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                            >
                                Access HRMS Portal
                            </button>
                            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Accelerating Growth Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Accelerating Growth Through Digital HR Solutions
                        </h2>
                        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                            In a fast-paced digital world, HR growth demands more than just adaptation — it requires innovation. 
                            Our HRMS empowers organizations to scale smarter with full-spectrum digital transformation and 
                            custom HR management services.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
                            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <UserGroupIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart HR Management</h3>
                            <p className="text-gray-600">
                                Boost efficiency and reduce operational friction with custom-built HR software designed to 
                                streamline your workflows, from employee onboarding to performance management and analytics.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8">
                            <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                                <CogIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Modern Office Management</h3>
                            <p className="text-gray-600">
                                Transform your workplace with smart digital solutions that enhance productivity, streamline 
                                communication, and simplify everyday HR operations — all tailored to fit your organizational needs.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8">
                            <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                                <WrenchScrewdriverIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Custom-Built HR Solutions</h3>
                            <p className="text-gray-600">
                                Get precisely what your organization needs with tailor-made HR solutions built to solve your 
                                unique challenges, drive efficiency, and support your long-term growth strategy.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8">
                            <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                                <ChartBarIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Intelligent HR Analytics</h3>
                            <p className="text-gray-600">
                                Optimize your HR operations with smart, scalable solutions designed to improve efficiency, 
                                reduce costs, and drive better decision-making across every aspect of your HR department.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-8">
                            <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                                <DevicePhoneMobileIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Digital Workplace Solutions</h3>
                            <p className="text-gray-600">
                                Empower your teams with integrated digital HR tools that support collaboration, flexibility, 
                                and productivity — built for the demands of today's dynamic work environments.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-8">
                            <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
                                <CloudIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Scalable Cloud HRMS</h3>
                            <p className="text-gray-600">
                                Leverage the power of the cloud with flexible, secure, and scalable HR applications that 
                                grow with your business — enabling seamless access, collaboration, and performance from anywhere.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Industry Expertise Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Industry Expertise That Drives HR Innovation
                        </h2>
                        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                            Our HRMS delivers high-impact digital solutions across a wide range of industries — combining 
                            deep domain knowledge with technical excellence to solve real-world HR challenges.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {[
                            'Technology & IT',
                            'Healthcare & Life Sciences',
                            'Financial Services',
                            'Manufacturing & Automotive',
                            'Retail & E-Commerce',
                            'Education & EdTech',
                            'Logistics & Supply Chain',
                            'Real Estate & PropTech',
                            'Travel & Hospitality',
                            'Media & Entertainment',
                            'Government & Public Sector',
                            'Non-Profit Organizations'
                        ].map((industry, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <p className="text-sm font-medium text-gray-700 text-center">{industry}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* End-to-End Services Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            End-to-End HR Digital Services
                        </h2>
                        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                            Our HRMS offers a comprehensive suite of digital services designed to support your HR department 
                            at every stage of its growth. From custom HR software development and employee portal design to 
                            advanced HR analytics and scalable cloud services — we deliver solutions that drive results.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: ServerIcon, title: 'Custom HR Software Development', color: 'blue' },
                            { icon: DevicePhoneMobileIcon, title: 'Employee Portal & Mobile Apps', color: 'green' },
                            { icon: ChartPieIcon, title: 'HR Analytics & Business Intelligence', color: 'purple' },
                            { icon: CloudIcon, title: 'Cloud HR Services & Migration', color: 'orange' },
                            { icon: ShieldCheckIcon, title: 'HR Security & Compliance', color: 'red' },
                            { icon: ChatBubbleLeftRightIcon, title: 'HR Support & Maintenance', color: 'indigo' },
                            { icon: CogIcon, title: 'HR Process Automation', color: 'teal' },
                            { icon: GlobeAltIcon, title: 'Global HR Solutions', color: 'pink' }
                        ].map((service, index) => (
                            <div key={index} className="text-center group">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-${service.color}-100 group-hover:bg-${service.color}-200 transition-colors duration-200`}>
                                    <service.icon className={`w-8 h-8 text-${service.color}-600`} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Why Choose Our HRMS Platform?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            'Complete Employee Lifecycle Management',
                            'Advanced Leave & Attendance Tracking',
                            'Performance Management & Reviews',
                            'Payroll Integration & Processing',
                            'Document Management System',
                            'Multi-level Approval Workflows',
                            'Real-time Analytics & Reporting',
                            'Mobile-first Responsive Design',
                            'Enterprise-grade Security',
                            'API Integration Capabilities',
                            '24/7 Technical Support',
                            'Scalable Cloud Infrastructure'
                        ].map((feature, index) => (
                            <div key={index} className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700 font-medium">{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your HR Operations?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        Join thousands of organizations that have revolutionized their HR processes with our 
                        comprehensive HRMS solution. Start your digital transformation journey today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onLoginClick}
                            className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                            Access HRMS Portal
                        </button>
                        <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200">
                            Schedule Demo
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
