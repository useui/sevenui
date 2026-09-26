import "./pull-back.css";

const FIELDS = [
  { id: "company", label: "Company", value: "Product designer at Northwind", on: true },
  { id: "location", label: "Location", value: "Lisbon, Portugal", on: true },
  { id: "email", label: "Email", value: "ava.moreno@northwind.app", on: false },
  { id: "phone", label: "Phone", value: "+351 912 408 331", on: false },
] as const;

/**
 * The story's picture: a switch inside the Public profile card (the switch-12 Component) inside an
 * account page (a stand-in for the account-02 Block). Illustrative, so no headings, the page chrome is
 * aria-hidden, and data-nosnippet keeps the mock names out of search snippets. The card's switches are
 * real controls; their state reaches the preview and the page through CSS :has(), with no JS.
 */
export function Stage() {
  return (
    <>
      <div className="pb-stage" data-scale="1" id="pb-stage">
      <figure className="pb-view" data-nosnippet="">
        <div aria-hidden="true" className="pb-try">
          Try the switch
        </div>

        <div className="pb-world">
          <div aria-hidden="true">
            <div className="pb-w pb-side">
              <div className="pb-logo">
                <i />
                Northwind
              </div>
              <div className="pb-nav">
                <span>Overview</span>
                <span>Projects</span>
                <span>Members</span>
                <span>Billing</span>
                <span className="pb-on">Account</span>
              </div>
            </div>
            <div className="pb-w pb-top">
              <span>
                Settings / <b>Account</b>
              </span>
              <span className="pb-av">AM</span>
            </div>
            <div className="pb-w pb-title">
              <span>Account</span>
              <span>Manage how you appear outside Northwind.</span>
            </div>
            <div className="pb-w pb-card pb-profile">
              <span className="pb-card-t">Profile</span>
              <span className="pb-card-d">Your name and contact details.</span>
              <div className="pb-field">
                <span>Name</span>
                <span>Ava Moreno</span>
                <span />
              </div>
              <div className="pb-field">
                <span>Handle</span>
                <span>@avamoreno</span>
                <span />
              </div>
              <div className="pb-field">
                <span>Email</span>
                <span>ava.moreno@northwind.app</span>
                <span className="pb-pill pb-email-pill">
                  <span className="pb-priv">Private</span>
                  <span className="pb-pub">Public</span>
                </span>
              </div>
            </div>
            <div className="pb-w pb-card pb-sessions">
              <span className="pb-card-t">Sessions</span>
              <div className="pb-session">
                <span>MacBook Pro · Lisbon</span>
                <span>Now</span>
              </div>
              <div className="pb-session">
                <span>iPhone · Lisbon</span>
                <span>2 h ago</span>
              </div>
            </div>
            <div className="pb-w pb-card pb-danger">
              <div>
                <span className="pb-card-t">Delete account</span>
                <span className="pb-card-d">This cannot be undone.</span>
              </div>
              <span className="pb-danger-btn">Delete</span>
            </div>
          </div>

          {/* biome-ignore lint/a11y/useSemanticElements: a <fieldset> brings its own border, padding and min-width, and this box is positioned in em on fixed coordinates */}
          <div aria-labelledby="pb-pc-title" className="pb-w pb-card pb-pc" role="group">
            <div className="pb-pc-hd">
              <span className="pb-card-t" id="pb-pc-title">
                Public profile
              </span>
              <span className="pb-card-d">Choose what people outside your team see.</span>
            </div>
            <div className="pb-pv">
              <div aria-hidden="true" className="pb-who">
                <span className="pb-av">AM</span>
                <span>
                  <span className="pb-who-name">Ava Moreno</span>
                  <span className="pb-who-handle">@avamoreno</span>
                </span>
              </div>
              <ul aria-live="polite">
                {FIELDS.map((field) => (
                  <li className={`pb-pv-${field.id}`} key={field.id}>
                    {field.value}
                  </li>
                ))}
                <li className="pb-empty">Only your name and photo are public.</li>
              </ul>
            </div>
            <div className="pb-rows">
              {FIELDS.map((field) => (
                <div className="pb-row" key={field.id}>
                  <label htmlFor={`pb-sw-${field.id}`}>
                    <span className="pb-row-label">{field.label}</span>
                    <span className="pb-row-value">{field.value}</span>
                  </label>
                  <span className="pb-right">
                    <span aria-hidden="true" className="pb-state">
                      <span className="pb-off-label">Private</span>
                      <span className="pb-on-label">Public</span>
                    </span>
                    <input
                      className="pb-sw"
                      defaultChecked={field.on}
                      id={`pb-sw-${field.id}`}
                      // biome-ignore lint/a11y/useAriaPropsForRole: a native checkbox exposes its checked state itself; aria-checked would need JS to stay in sync, and ARIA in HTML says not to set it
                      role="switch"
                      type="checkbox"
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </figure>
      <div aria-hidden="true" className="pb-readout">
        <span className="pb-ro-1" data-label="Primitive">
          Primitive
        </span>
        <span className="pb-ro-2" data-label="Component">
          Component
        </span>
        <span className="pb-ro-3" data-label="Block">
          Block
        </span>
      </div>
      </div>
      <p className="mt-2 hidden text-[0.8125rem] text-muted-foreground min-[900px]:block">
        The switch keeps its state as you scroll: flip Email, then watch the card and the page follow it.
      </p>
    </>
  );
}
