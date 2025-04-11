import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import AnimatedFoodIcons from './AnimatedFoodIcons';

// Import for animations
import { motion } from 'framer-motion';

const AboutUs = () => {
  const { theme } = useTheme();
  
  // Refs for scroll animations
  const storyRef = useRef(null);
  const teamRef = useRef(null);
  const contactRef = useRef(null);

  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: "Emirhan Kara",
      role: "Head of Frontend Developers & Team Leader",
      image: "src/assets/emirhan_profilepic.jpeg",
      bio: "As a  Computer Engineering student at Kadir Has University, Emirhan leads the team and manages the frontend development.",
      linkedinUrl:"https://www.linkedin.com/in/emirhan-kara37/",
      githubUrl:"https://github.com/Emirhan-Kara"
    },
    {
      id: 2,
      name: "Hayrunnisa Çavdar",
      role: "Head of Backend Developers",
      image: "src/assets/nisa_profilepic.jpg",
      bio: "Hayrunnisa Computer Engineering student at Kadir Has University who manages the backend infrastructure.",
      linkedinUrl:"https://www.linkedin.com/in/hnisacavdar/",
      githubUrl:"https://github.com/cybernisa"
    },
    {
      id: 3,
      name: "Mohammad Zaid",
      role: "Head of Testing & Front Member",
      image: "src/assets/zaid_profilepic.jpg",
      bio: "A Computer Engineering student at Kadir Has University, Mohammad ensures the quality and reliability of the YeBitir platform.",
      linkedinUrl:"https://www.linkedin.com/in/mohammadzaid99/",
      githubUrl: "https://github.com/Mohammad-Zaid-1"
    },
    {
      id: 4,
      name: "Rumeysa Kayam",
      role: "Head of Documentation & Backend Member",
      image: "src/assets/rumeysa_profilepic.jpeg",
      bio: "Rumeysa Computer Engineering student at Kadir Has University who documents the project's development",
      linkedinUrl: "https://www.linkedin.com/in/rumeysakayam/",
      githubUrl: "https://github.com/rumeysakayam"
    }
  ];

  // Scroll animation
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    if (storyRef.current) observer.observe(storyRef.current);
    if (teamRef.current) observer.observe(teamRef.current);
    if (contactRef.current) observer.observe(contactRef.current);

    return () => {
      if (storyRef.current) observer.unobserve(storyRef.current);
      if (teamRef.current) observer.unobserve(teamRef.current);
      if (contactRef.current) observer.unobserve(contactRef.current);
    };
  }, []);

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="overflow-hidden" style={{ backgroundColor: theme.core.containerHoover, color: theme.core.text, position: 'relative' }}>
      {/* Hero section with animated background */}
      <div 
        className="relative py-24 md:py-32 overflow-hidden rounded-b-[50px]"
        style={{ backgroundColor: theme.core.container }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          {/* Animated food icons background */}
          <AnimatedFoodIcons count={25} />
        </div>

        <motion.div 
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="text-gradient">Discover Share Savor</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-xl max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Food is more than just sustenance, it is an experience, a story, a connection.
            At <span className="text-gradient font-bold">Ye Bitir</span>, we bring together food lovers from around the world to share and discover mouthwatering recipes.
          </motion.p>
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="h-1 w-20 mx-auto rounded-full" style={{ backgroundColor: theme.core.text }}></div>
          </motion.div>
        </motion.div>
      </div>

      
      
      {/* Our story section */}
      <div ref={storyRef} className="container mx-auto px-4 py-24 text-center opacity-0 transition-opacity duration-1000">
        <h2 style={{ color: theme.core.text }} className="text-4xl md:text-4xl font-bold mb-8 relative inline-block">
          Our Project
        </h2>
        <div className="max-w-4xl mx-auto bg-gradient-to-br p-8 rounded-2xl shadow-xl transform hover:scale-[1.01] transition-transform duration-300" style={{ 
          backgroundColor: theme.core.container, 
          boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)` 
        }}>
          <p className="text-lg md:text-xl leading-relaxed" style={{ color: theme.core.text }}>
            YeBitir (meaning "Eat-it-Up" in Turkish) is a Software Engineering course project developed by 3rd year Computer Engineering students at Kadir Has University.
          </p>
        </div>
      </div>

      {/* Curved section divider */}
      <div className="curve-divider">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path 
            fill={theme.core.container} 
            fillOpacity="1" 
            d="M0,32L40,48C80,64,160,96,240,101.3C320,107,400,85,480,80C560,75,640,85,720,96C800,107,880,117,960,106.7C1040,96,1120,64,1200,53.3C1280,43,1360,53,1400,58.7L1440,64L1440,120L1400,120C1360,120,1280,120,1200,120C1120,120,1040,120,960,120C880,120,800,120,720,120C640,120,560,120,480,120C400,120,320,120,240,120C160,120,80,120,40,120L0,120Z"></path>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path 
            fill={theme.core.container} 
            fillOpacity="1" 
            d="M0,0L48,10.7C96,21,192,43,288,48C384,53,480,43,576,37.3C672,32,768,32,864,48C960,64,1056,96,1152,96C1248,96,1344,64,1392,48L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>
      
      {/* Team section */}
      <div ref={teamRef} className="text-center container mx-auto px-4 py-24 opacity-0 transition-opacity duration-1000">
        <motion.h2 
          style={{ color: theme.core.text }} 
          className="text-3xl md:text-4xl font-bold mb-16 relative inline-block mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Meet Our Team
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {teamMembers.map((member) => (
            <motion.div 
              key={member.id} 
              variants={itemVariants}
              className="rounded-[30px] shadow-xl overflow-hidden transform-gpu hover:translate-y-[-10px] transition-all duration-300"
              style={{ 
                backgroundColor: theme.core.container,
                boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`
              }}
            >
              <div className="relative overflow-hidden group">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex justify-center gap-4">
                    <a href={member.githubUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm-1-7a1 1 0 100-2 1 1 0 000 2zm7 7h-2v-4c0-.55-.45-1-1-1s-1 .45-1 1v4h-2v-6h2v1.39c.36-.63 1.26-.78 1.8-.78 1.54 0 2.2 1.31 2.2 3.01V17z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 style={{ color: theme.core.text }} className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-sm mb-4 font-medium" style={{ color: theme.headerfooter.logoRed }}>{member.role}</p>
                <p className="leading-relaxed">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>


      </div>
      
      {/* Wavy divider before Join us section */}
      <div className="wavy-divider">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path 
            fill={theme.core.container} 
            fillOpacity="1" 
            d="M0,32L40,48C80,64,160,96,240,101.3C320,107,400,85,480,80C560,75,640,85,720,96C800,107,880,117,960,106.7C1040,96,1120,64,1200,53.3C1280,43,1360,53,1400,58.7L1440,64L1440,120L1400,120C1360,120,1280,120,1200,120C1120,120,1040,120,960,120C880,120,800,120,720,120C640,120,560,120,480,120C400,120,320,120,240,120C160,120,80,120,40,120L0,120Z"></path>
        </svg>
      </div>
      
      {/* Join us section */}
      <div 
        style={{ backgroundColor: theme.core.container, color: theme.core.text }} 
        className="py-20 text-center relative overflow-hidden"
      >
        
        <AnimatedFoodIcons count={40} />
        {/* Background pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-10">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${100 + Math.random() * 200}px`,
                  height: `${100 + Math.random() * 200}px`,
                  backgroundColor: theme.core.text,
                  opacity: 0.1,
                  transform: `scale(${Math.random() * 0.6 + 0.7})`,
                  filter: 'blur(50px)',
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Join Our Culinary Community
          </motion.h2>
          <motion.p 
            className="text-lg max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Whether you're a seasoned chef or a curious beginner, there's a place for you at YeBitir.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link 
              to="/add-recipe" 
              style={{ 
                backgroundColor: 'transparent',
                color: theme.core.text,
                borderColor: theme.core.text
              }} 
              className="border-2 py-4 px-8 rounded-full font-medium inline-flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <span className="mr-2">📝</span> Share Recipes
            </Link>
            <Link 
              to="/recipes" 
              style={{ 
                backgroundColor: theme.core.containerHoover,
                color: theme.core.text,
              }} 
              className="py-4 px-8 rounded-full font-medium inline-flex items-center justify-center shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden"
            >
              <span className="mr-2">🍽️</span> Explore Recipes
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Curved bottom divider for Join Us section */}
      <div className="curved-bottom-divider relative z-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path 
            fill={theme.core.container} 
            fillOpacity="1" 
            d="M0,0L48,10.7C96,21,192,43,288,48C384,53,480,43,576,37.3C672,32,768,32,864,48C960,64,1056,96,1152,96C1248,96,1344,64,1392,48L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>
      
      {/* Contact section */}
      <div ref={contactRef} className="text-center container mx-auto px-4 py-24 opacity-0 transition-opacity duration-1000">
        <h2 style={{ color: theme.core.text }} className="text-4xl font-bold text-center mb-16 relative inline-block">
          Contact Us
        </h2>
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2">
            <div 
              style={{ backgroundColor: theme.core.container }} 
              className="p-8 rounded-[30px] shadow-xl h-full transform-gpu hover:translate-y-[-5px] transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-6" style={{ color: theme.core.text }}>Get In Touch</h3>
              <p style={{ color: theme.core.text }} className="mb-8 text-lg">Have questions, suggestions, or feedback about our project? We'd love to hear from you!</p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="p-3 rounded-full mr-4" style={{ backgroundColor: theme.core.containerHoover }}>
                    <span style={{ color: theme.core.text }} className="text-xl">📍</span>
                  </div>
                  <div className='text-left'>
                    <h4 className="font-medium mb-1">Our Location</h4>
                    <span style={{ color: theme.core.text }}>Kadir Has University, Cibali, Istanbul, Turkey</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-3 rounded-full mr-4" style={{ backgroundColor: theme.core.containerHoover }}>
                    <span style={{ color: theme.core.text }} className="text-xl">📧</span>
                  </div>
                  <div className='text-left'>
                    <h4 className="font-medium mb-1">Email Us</h4>
                    <span style={{ color: theme.core.text }}>yebitir@gmail.com</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-3 rounded-full mr-4" style={{ backgroundColor: theme.core.containerHoover }}>
                    <span style={{ color: theme.core.text }} className="text-xl">🏛️</span>
                  </div>
                  <div className='text-left'>
                    <h4 className="font-medium mb-1">Department</h4>
                    <span style={{ color: theme.core.text }}>Department of Computer Engineering</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
  <form 
    style={{ backgroundColor: theme.core.container }} 
    className="p-8 rounded-[30px] shadow-xl transform-gpu hover:translate-y-[-5px] transition-all duration-300"
  >
    <h3 className="text-2xl font-bold mb-6" style={{ color: theme.core.text }}>Leave Us a Message</h3>
    <div className="mb-6">
      <input 
        type="text" 
        id="name" 
        placeholder="Your Name"
        className="w-full p-4 border rounded-[15px] focus:outline-none transition-all duration-300 focus:ring-2" 
        style={{ 
          backgroundColor: theme.headerfooter.searchBox, 
          borderColor: theme.core.containerHoover, 
          color: theme.core.text 
        }} 
      />
    </div>
    <div className="mb-6">
      <input 
        type="email" 
        id="email" 
        placeholder="Email Address"
        className="w-full p-4 border rounded-lg focus:outline-none transition-all duration-300 focus:ring-2" 
        style={{ 
          backgroundColor: theme.headerfooter.searchBox, 
          borderColor: theme.core.containerHoover, 
          color: theme.core.text 
        }} 
      />
    </div>
    <div className="mb-6">
      <textarea 
        id="message" 
        rows="5" 
        placeholder="Your Message"
        className="w-full p-4 border rounded-lg focus:outline-none transition-all duration-300 focus:ring-2" 
        style={{ 
          backgroundColor: theme.headerfooter.searchBox, 
          borderColor: theme.core.containerHoover, 
          color: theme.core.text 
        }}
      ></textarea>
    </div>
    <button 
      type="submit" 
      style={{ backgroundColor: theme.headerfooter.logoRed, color: "#ffffff" }} 
      className="py-4 px-8 rounded-[15px] hover:shadow-lg transition-all duration-300 w-full cursor-pointer font-medium text-lg hover:scale-[1.02]"
    >
      Send Message
    </button>
  </form>
</div>
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          background-image: linear-gradient(135deg, ${theme.headerfooter.logoRed}, ${theme.core.text});
        }
        
        .animate-fade-in {
          animation: fadeIn 1s forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .bg-pattern {
          background-image: radial-gradient(${theme.core.text} 1px, transparent 1px);
          background-size: 40px 40px;
        }
        
        /* Wave divider styles */
        .wave-divider, .curve-divider, .wavy-divider, .curved-bottom-divider, .blob-footer {
          display: block;
          width: 100%;
          line-height: 0;
          margin: 0;
          z-index: 1;
          position: relative;
        }
        
        .wave-divider svg, .curve-divider svg, .wavy-divider svg, .curved-bottom-divider svg {
          display: block;
          width: 100%;
          height: 120px;
        }
        
        /* Make dividers responsive */
        @media (max-width: 768px) {
          .wave-divider svg, .curve-divider svg, .wavy-divider svg, .curved-bottom-divider svg {
            height: 80px;
          }
        }
        
        @media (max-width: 480px) {
          .wave-divider svg, .curve-divider svg, .wavy-divider svg, .curved-bottom-divider svg {
            height: 60px;
          }
        }
      `}} />

      {/* Blob footer decoration */}
      <div className="relative">
        <div className="blob-footer relative h-20 overflow-hidden">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{ height: '100%', width: '100%' }}>
            <path d="M0.00,49.99 C150.00,150.00 349.20,-49.99 500.00,49.99 L500.00,150.00 L0.00,150.00 Z" 
                  style={{ fill: theme.headerfooter.background, stroke: 'none' }}></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
