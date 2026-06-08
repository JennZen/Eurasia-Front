import { Link } from "react-router-dom";

// Static landing content — backend has no /api/continents endpoint
// (see CONTINENT_IDS note in services/api.js).
const continents = [
  {
    id: 1,
    name: "Europe",
    image: "/images/Europe_on_the_globe_(red).png",
    description:
      "Unlock a deeper understanding of Europe with our high-resolution interactive map. Seamlessly toggle through mysterious regions and historical territories to see the continent’s geography in vivid detail.",
    population: "745 Mil People",
    territory: "10.2 Mil km²",
    countries: "44 Countries",
    link: "/europe",
  },
  {
    id: 2,
    name: "Asia",
    image: "/images/Asia_on_the_globe_(red).svg",
    description:
      "Immerse yourself in a comprehensive digital atlas of the Asian continent. Every detail is meticulously mapped, allowing you to discover the fascinating diversity and scale of Asia’s most iconic landmasses.",
    population: "4.86 Bil People",
    territory: "44.5 Mil km²",
    countries: "48 Countries",
    link: "/asia",
  },
];

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
                <i className="fa fa-flag"></i> {continent.countries}
              </li>
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContinentSection;
