import React from 'react';

const Testimonials = () => {
    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "HR Director",
            company: "TechCorp Inc.",
            content: "HRMS Pro has revolutionized how we manage our workforce. The intuitive interface and powerful features have saved us countless hours every week.",
            avatar: "SJ"
        },
        {
            name: "Michael Chen",
            role: "CEO",
            company: "StartupXYZ",
            content: "The analytics and reporting features give us insights we never had before. It's like having a dedicated HR analyst on our team.",
            avatar: "MC"
        },
        {
            name: "Emily Rodriguez",
            role: "Operations Manager",
            company: "Global Solutions",
            content: "Implementation was seamless and the support team was incredible. We were up and running in just a few days.",
            avatar: "ER"
        }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        What Our Customers Say
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Don't just take our word for it. Here's what industry leaders have to say about HRMS Pro.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="card">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {testimonial.avatar}
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                                    <p className="text-gray-600">{testimonial.role}</p>
                                    <p className="text-sm text-primary-600">{testimonial.company}</p>
                                </div>
                            </div>
                            <p className="text-gray-700 italic">
                                "{testimonial.content}"
                            </p>
                            <div className="flex text-yellow-400 mt-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20" style={{ width: '20px', height: '20px' }}>
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
