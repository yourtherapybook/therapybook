import React from 'react';
import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../../utils/constants';

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Real stories from people who found the support they needed through TherapyBook.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-6 rounded-2xl shadow-subtle hover:shadow-hover transition-all duration-300 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-3 -left-3 bg-primary-500 p-2 rounded-lg">
                <Quote className="h-4 w-4 text-white" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-neutral-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-neutral-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-neutral-600">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-500 mb-2">1000+</div>
            <div className="text-neutral-600">Successful Matches</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-500 mb-2">4.9</div>
            <div className="text-neutral-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-500 mb-2">95%</div>
            <div className="text-neutral-600">Client Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;