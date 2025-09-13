import React from 'react';

const Stats = () => {
    const stats = [
        {
            number: "10,000+",
            label: "Companies Trust Us",
            description: "Growing businesses worldwide"
        },
        {
            number: "2M+",
            label: "Employees Managed",
            description: "Across all industries"
        },
        {
            number: "99.9%",
            label: "Uptime Guarantee",
            description: "Reliable and secure platform"
        },
        {
            number: "24/7",
            label: "Customer Support",
            description: "Always here to help"
        }
    ];

    return (
        <section className="py-20 bg-primary-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Trusted by Industry Leaders
                    </h2>
                    <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                        Join thousands of companies that have transformed their HR operations with our platform.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                {stat.number}
                            </div>
                            <div className="text-xl font-semibold text-primary-100 mb-1">
                                {stat.label}
                            </div>
                            <div className="text-primary-200">
                                {stat.description}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
