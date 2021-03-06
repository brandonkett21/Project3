import React from 'react';
import { Link } from 'react-router-dom';
import "./nav.css";

function Nav(props) {
    return (
        <div className="navbar-fixed">
            <nav>
                <div className="nav-wrapper">
                    <a href="/" className="brand-logo left">Volunteer Ops</a>
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        <li className={(props.loggedIn === "true") ? "" : "hiddenForNav"}><Link to="#">{`Welcome, ${localStorage.getItem('username')}!`}</Link></li>
                        <li onClick={props.manageLogin} style={{ cursor: "pointer" }}>

                        <Link to={(props.loggedIn === "true") ? "/" : "/loginpage"}>
                            {(props.loggedIn === "true") ? "Log Out" : "Log In"}</Link>

                        </li>
                        <li className={(props.loggedIn === "true") ? "hiddenForNav" : ""}><Link to="/signup">Sign Up</Link></li>
                        <li className={(props.loggedIn === "true") ? "" : "hiddenForNav"}><Link to="/myevents">My Events</Link></li>
                        <li className={(props.loggedIn === "true") ? "" : "hiddenForNav"}><Link to="/myaccount">My Account</Link></li>
                    </ul>
                </div>
            </nav>
        </div>
    )
}

export default Nav;