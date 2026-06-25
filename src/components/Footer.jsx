import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer__brand">
        <BrandLogo />
      </p>
      <p className="footer__text">Open event layer for Mainfranken&apos;s tech community.</p>
      <p className="footer__meta mono">MVP · hackathon prototype</p>
      <p className="footer__credit">
        Erstellt von{" "}
        <a
          href="https://www.millionpainter.de"
          target="_blank"
          rel="noopener noreferrer"
          className="footer__credit-link"
        >
          Millionpainter
        </a>
      </p>
    </footer>
  );
}
