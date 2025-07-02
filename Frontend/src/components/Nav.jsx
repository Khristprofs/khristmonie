import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { FiUser, FiGlobe } from "react-icons/fi";

const Nav = () => {
    return (
        <header className="flex justify-between items-center p-4 fixed top-0 w-full z-40 bg-white shadow-sm">
            {/* Logo */}
            <div className="text-2xl font-bold text-purple-800 ml-16">
                <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                    Khristmonie
                </span>
            </div>

            {/* Main Navigation */}
            <nav>
                <ul className="flex gap-8 items-center font-semibold -ml-22">
                    <li className="group relative">
                        <span className="cursor-pointer flex items-center text-purple-700 hover:text-purple-500 transition-colors">
                            Personal <FaChevronDown className="ml-1 text-xs" />
                        </span>
                    </li>
                    <li className="group relative">
                        <span className="cursor-pointer flex items-center text-purple-700 hover:text-purple-500 transition-colors">
                            Business <FaChevronDown className="ml-1 text-xs" />
                        </span>
                    </li>
                    <li className="group relative">
                        <span className="cursor-pointer flex items-center text-purple-700 hover:text-purple-500 transition-colors">
                            Company <FaChevronDown className="ml-1 text-xs" />
                        </span>
                    </li>
                    <li className="group relative">
                        <span className="cursor-pointer flex items-center text-purple-700 hover:text-purple-500 transition-colors">
                            Help <FaChevronDown className="ml-1 text-xs" />
                        </span>
                    </li>
                </ul>
            </nav>

            {/* Right-side Actions */}
            <div className="flex items-center gap-8 mr-20">
                <Link
                    to="/login"
                    className="text-purple-700 hover:text-purple-500 transition-colors font-bold"
                >
                    Login
                </Link>
                <Link
                    to="/signup"
                    className="text-white font-bold transition-colors bg-purple-900 pt-2 pb-2 px-4 rounded-lg shadow-md hover:shadow-lg"
                >
                    Sign Up
                </Link>
                <span className="text-purple-700 hover:text-purple-500 transition-colors cursor-pointer">
                    <FiGlobe />
                </span>
            </div>
        </header>
    );
};

export default Nav;