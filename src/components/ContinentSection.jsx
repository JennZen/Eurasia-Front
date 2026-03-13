import { Link } from "react-router-dom";
import { continents } from "../data/continents";

const ContinentSection = () => {
  return (
    <div className="eurasian">
      {continents.map((continent) => (
        <div key={continent.id} className="continent">
          <div className="img-continent">
            <img src={continent.image} alt={continent.name} />
          </div>
          <div className="about-continent">
            <div className="header-continent">
              <p>{continent.name}</p>
              <Link to={continent.link}>Explore More</Link>
            </div>
            <p className="description">{continent.description}</p>
            <ul className="info">
              <li>
                <i className="fa fa-user"></i> {continent.population}
              </li>
              <li>
                <i className="fa fa-globe"></i> {continent.territory}
              </li>
              <li>
                <i className="fa fa-home"></i> {continent.avgPrice}
              </li>
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContinentSection;
