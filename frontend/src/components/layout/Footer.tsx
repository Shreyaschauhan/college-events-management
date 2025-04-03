
import { Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">EventHub</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Your one-stop platform for discovering, creating, and managing events
              within your organization.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-base">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-base">User Types</h4>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Students
              </li>
              <li className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Event Organizers
              </li>
              <li className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Administrators
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-base">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@eventhub.example</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+919328225804</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>PDEU,Gandhinagar ,382007</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} EventHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
