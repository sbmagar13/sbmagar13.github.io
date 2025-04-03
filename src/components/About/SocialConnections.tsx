'use client';

import { motion } from 'framer-motion';
import { 
  FaGithub, 
  FaLinkedin, 
  FaTwitter, 
  FaEnvelope, 
  FaGlobe, 
  FaStackOverflow,
  FaMedium,
  FaMastodon,
  FaSpotify,
  FaRoad
} from 'react-icons/fa';

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  username: string;
}

const SocialConnections = () => {
  const socialLinks: SocialLink[] = [
    { 
      name: 'GitHub', 
      url: 'https://github.com/sbmagar13', 
      icon: <FaGithub size={24} />, 
      color: 'bg-gray-800 hover:bg-gray-700',
      username: 'sbmagar13'
    },
    { 
      name: 'LinkedIn', 
      url: 'https://linkedin.com/in/sbmagar13', 
      icon: <FaLinkedin size={24} />, 
      color: 'bg-blue-700 hover:bg-blue-600',
      username: 'sbmagar13'
    },
    { 
      name: 'Twitter', 
      url: 'https://twitter.com/S_agarM_agar', 
      icon: <FaTwitter size={24} />, 
      color: 'bg-blue-500 hover:bg-blue-400',
      username: 'S_agarM_agar'
    },
    { 
      name: 'Email', 
      url: 'mailto:mail@budhathokisagar.com.np', 
      icon: <FaEnvelope size={24} />, 
      color: 'bg-red-600 hover:bg-red-500',
      username: 'mail@budhathokisagar.com.np'
    },
    { 
      name: 'Website', 
      url: 'https://budhathokisagar.com.np', 
      icon: <FaGlobe size={24} />, 
      color: 'bg-green-600 hover:bg-green-500',
      username: 'budhathokisagar.com.np'
    },
    { 
      name: 'Stack Overflow', 
      url: 'https://stackoverflow.com/users/10819100/sagar-budhathoki-magar', 
      icon: <FaStackOverflow size={24} />, 
      color: 'bg-orange-600 hover:bg-orange-500',
      username: 'sagar-budhathoki-magar'
    },
    { 
      name: 'Medium', 
      url: 'https://medium.com/@sbmagar13', 
      icon: <FaMedium size={24} />, 
      color: 'bg-gray-700 hover:bg-gray-600',
      username: '@sbmagar13'
    },
    { 
      name: 'Mastodon', 
      url: 'https://mastodon.social/@sbmagar', 
      icon: <FaMastodon size={24} />, 
      color: 'bg-purple-600 hover:bg-purple-500',
      username: '@sbmagar'
    },
    { 
      name: 'Roadmap.sh', 
      url: 'https://roadmap.sh/u/sbmagar13', 
      icon: <FaRoad size={24} />, 
      color: 'bg-blue-800 hover:bg-blue-700',
      username: 'sbmagar13'
    },
    { 
      name: 'Spotify', 
      url: 'https://open.spotify.com/user/qzb6mxppi1qt8o50cgkrbyw4v', 
      icon: <FaSpotify size={24} />, 
      color: 'bg-green-500 hover:bg-green-400',
      username: 'Sagar Budhathoki'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-green-400 mb-4">Connection Endpoints</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {socialLinks.map((link, index) => (
          <motion.a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center p-3 rounded-md text-white ${link.color} transition-colors duration-300`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="mr-3">{link.icon}</div>
            <div>
              <div className="font-medium">{link.name}</div>
              <div className="text-xs opacity-80">{link.username}</div>
            </div>
          </motion.a>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-800 rounded-md border border-gray-700">
        <h4 className="text-sm font-semibold text-green-400 mb-2">Connection Status</h4>
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
          <span className="text-sm text-gray-300">All endpoints available and ready for connection</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Response time: &lt; 24 hours • Preferred protocol: Email, LinkedIn
        </div>
      </div>
    </motion.div>
  );
};

export default SocialConnections;
