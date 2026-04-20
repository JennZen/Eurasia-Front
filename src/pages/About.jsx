import "../styles/index.css";
import "../styles/About.css";

const About = () => {
  return (
    <section className="about-page">
      <div className="about-hero">
        <div className="about-hero-overlay" />
        <div className="about-hero-content">
          <h1 className="about-title">About Project Eurasia</h1>
          <div className="about-text">
            <p>
              Discover the vast diversity of Eurasia through our comprehensive digital
              platform. Our site offers detailed information on every country across
              the continent, featuring high-quality imagery of iconic landmarks and
              up-to-the-minute news. Explore cultural heritage and geographical data 
              all in one centralized location designed for modern explorers.
            </p>
            <p>
              Navigate the world's largest landmass with ease using our specialized
              interactive maps for both Europe and Asia. These tools allow you to
              visualize exact locations, borders, and regions, providing a dynamic
              way to study the geography of these two historic continents.
            </p>
            <p>
              Whether you are tracking the latest regional updates or planning a 
              virtual tour of famous attractions, our resources bridge the gap 
              between information and inspiration. Start your journey today and 
              uncover the unique stories that define the Eurasian landscape.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
