import { Link } from "react-router-dom";
import { Building2, Calculator, Users, Shield, Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const LandingFooter = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Property Pro</h3>
              <p className="text-gray-400 mb-4">
                Smart analysis for Australian property investment. Professional-grade tools for investors and financial advisors.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>ASIC Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Bank-Level Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Australian Owned</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/auth" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Calculator className="h-4 w-4" />
                  <span>Tax Calculations</span>
                </Link>
              </li>
              <li>
                <Link to="/auth" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Building2 className="h-4 w-4" />
                  <span>40-Year Projections</span>
                </Link>
              </li>
              <li>
                <Link to="/auth" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Users className="h-4 w-4" />
                  <span>Multi-Investor Modeling</span>
                </Link>
              </li>
              <li>
                <Link to="/auth" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <ArrowRight className="h-4 w-4" />
                  <span>Professional Reports</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/auth" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>support@propertypro.com.au</span>
                </Link>
              </li>
              <li>
                <Link to="/auth" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>1300 PROPERTY</span>
                </Link>
              </li>
              <li>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>Sydney, Australia</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © 2024 Property Pro. All rights reserved. Professional property investment analysis platform.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/auth" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/auth" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/auth" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
