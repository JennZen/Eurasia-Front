import "../styles/index.css";
import "./About.css";

const About = () => {
  return (
    <section className="about-page">
      <div className="about-hero">
        <div className="about-hero-overlay" />
        <div className="about-hero-content">
          <h1 className="about-title">About Project Eurasia</h1>
          <div className="about-text">
            <p>
              Cras porttitor, elit ac varius varius, lectus ipsum rutrum odio,
              nec aliquet felis ipsum sed est. Fusce in tortor ultricies,
              scelerisque nibh sit amet, tristique lectus. Vestibulum ante ipsum
              primis in faucibus orci luctus et ultrices posuere cubilia curae.
            </p>
            <p>
              Integer ut turpis at lectus gravida aliquet. Donec elementum risus
              in arcu posuere, vitae luctus mauris ultrices. Mauris vel
              porttitor lacus, sed elementum felis.
            </p>
            <p>
              In euismod, nisi a feugiat laoreet, felis nunc varius augue, nec
              porta velit purus in augue. Sed in purus nec tellus pulvinar
              feugiat et ac erat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
