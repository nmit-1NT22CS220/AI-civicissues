import React from "react";
import { motion } from "framer-motion";
import { FileText, Search, CheckCircle, MessageCircle } from "lucide-react";

function HowItWorks() {
  const steps = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Report Issue",
      description: "Easily submit your complaint with photos and detailed description. Our intuitive form makes it simple to provide all necessary information.",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Track Progress",
      "description": "Monitor your complaint's journey in real-time. Get instant updates when your issue is assigned, reviewed, or resolved.",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Get Resolved",
      description: "Receive notifications when your issue is fixed. View before/after photos and official resolution reports.",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Provide Feedback",
      description: "Rate the resolution quality and provide feedback. Help us improve the system for everyone.",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-5">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our streamlined process ensures your voice is heard and your issues are resolved quickly and efficiently.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="text-center relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-300 to-green-300 transform translate-x-8 z-0" />
              )}
              
              <motion.div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${step.bgColor} mb-6 relative z-10`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className={step.color}>
                  {step.icon}
                </div>
              </motion.div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
