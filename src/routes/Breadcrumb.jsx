import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div>
      <style>
        {`
          .breadcrumb {
            list-style: none;
            display: flex;
            gap: 5px;
          }

          .breadcrumb li {
            display: inline;
          }

          .breadcrumb a {
            text-decoration: none;
            color: blue;
          }

          .breadcrumb span {
            color: gray;
          }
        `}
      </style>
      <nav>
        <ul className="breadcrumb">
          <li>
            <Link to="/">Home</Link>
          </li>
          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            return (
              <li key={to}>
                {isLast ? (
                  <span>{`/${value}`}</span>
                ) : (
                  <Link to={`/${value}`}>{`/${value}`}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Breadcrumb;
