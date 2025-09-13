import React from 'react';

const CTA = ({ onLoginClick }) => {
    return (
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to Transform Your HR Operations?
                </h2>
                <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
                    Join thousands of companies already using HRMS Pro to streamline their human resources management.
                    Start your free trial today - no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={onLoginClick}
                        className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        Start Free Trial
                    </button>
                    <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105">
                        Schedule Demo
                    </button>
                </div>
                <p className="text-primary-200 mt-6 text-sm">
                    ✓ 14-day free trial ✓ No setup fees ✓ Cancel anytime
                </p>
            </div>
        </section>
    );
};

export default CTA;
