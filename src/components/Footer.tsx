import { BRAND, DEMO_DISCLOSURE } from "../lib/site";

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot__inner">
        <div className="foot__brand">
          <div className="row gap-12 foot__mark-row">
            <span aria-hidden="true" className="nav__mark">
              A
            </span>
            <span className="foot__name">{BRAND.name}</span>
          </div>
          <p className="dim foot__about">
            Automatizări de vânzări pentru {BRAND.audience}: răspuns, calificare, follow-up și programări,
            fără să depindă de memoria nimănui.
          </p>
        </div>

        <nav aria-label="Secțiuni" className="foot__nav">
          <h3 className="foot__navtitle">Pagina</h3>
          <ul>
            <li>
              <a href="#problema">Problema</a>
            </li>
            <li>
              <a href="#cum-functioneaza">Demonstrația</a>
            </li>
            <li>
              <a href="#canale">Canale</a>
            </li>
            <li>
              <a href="#ce-face">Ce face</a>
            </li>
            <li>
              <a href="#contact">Demo</a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="wrap">
        <div className="hairline foot__rule" />
        <div className="row between gap-16 foot__bottom">
          <span className="dim foot__disclosure">{DEMO_DISCLOSURE}</span>
          <span className="dim foot__legal">© {new Date().getFullYear()} {BRAND.name}</span>
        </div>
      </div>
    </footer>
  );
}
