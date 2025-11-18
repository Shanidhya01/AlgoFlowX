import React from 'react';
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa";
import styles from '../styles/Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brandSection}>
            <div className={styles.logoContainer}>
              <span className={styles.logo}>🚀</span>
              <span className={styles.brandName}>Shanidhya Kumar</span>
            </div>
            <p className={styles.tagline}>Building innovative solutions with passion</p>
          </div>
          
          <div className={styles.linksSection}>
            <div className={styles.linkColumn}>
              <h4 className={styles.linkTitle}>Connect</h4>
              <a href="https://github.com/Shanidhya01" className={styles.link} target="_blank" rel="noopener noreferrer">
                <FaGithub className={styles.linkIcon} size={18} />
                GitHub
              </a>
              <a href="https://linkedin.com/in/shanidhya-kumar" className={styles.link} target="_blank" rel="noopener noreferrer">
                <FaLinkedinIn className={styles.linkIcon} size={18} />
                LinkedIn
              </a>
            </div>
            
            <div className={styles.linkColumn}>
              <h4 className={styles.linkTitle}>Projects</h4>
              <a href="#" className={styles.link}>
                <span className={styles.linkIcon}>⚡</span>
                AlgoFlowX
              </a>
              <a href="https://shanidhyakumar.vercel.app" className={styles.link} target="_blank" rel="noopener noreferrer">
                <span className={styles.linkIcon}>🎯</span>
                Portfolio
              </a>
            </div>
          </div>
        </div>
        
        <div className={styles.divider}></div>
        
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            © {currentYear} AlgoFlowX. Crafted with ❤️ by Shanidhya Kumar
          </p>
          <div className={styles.socialLinks}>
            <a href="https://twitter.com/kshanidhya01" className={styles.socialLink} aria-label="Twitter" target="_blank" rel="noopener noreferrer">
              <FaXTwitter size={20} />
            </a>
            <a href="https://instagram.com/kshanidhya" className={styles.socialLink} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <FaInstagram size={20} />
            </a>
            <a href="mailto:luckykumar0011s@gmail.com" className={styles.socialLink} aria-label="Email">
              <SiGmail size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

