import { Link } from "wouter";
import { SearchBar } from "./search";
import './header.css';

export function MailboxHeader() {
  return (
    <div className="header">
      <a href="/" className="brand-name">@ Mail Archive Viewer</a>
      <SearchBar />
      <Link className="settings-icon" to="~/settings">&#x2699;</Link>
    </div>
  )
}
