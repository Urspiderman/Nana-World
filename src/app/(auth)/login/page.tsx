
import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";
import "./login.css";

const AUTH = "/images/auth";

export default function LoginPage() {
  return (
    <main className="sw-login-page">
      {/* Background texture */}
      <div className="sw-login-paper" aria-hidden="true" />

      {/* Left decoration */}
      <div className="sw-login-decoration sw-decoration-left">
        <Image
          src={`${AUTH}/compositions/login-left.webp`}
          alt=""
          fill
          priority
          sizes="(max-width: 1200px) 260px, 460px"
          className="sw-decoration-image"
        />
      </div>

      {/* Right decoration */}
      <div className="sw-login-decoration sw-decoration-right">
        <Image
          src={`${AUTH}/compositions/login-right.webp`}
          alt=""
          fill
          priority
          sizes="(max-width: 1200px) 260px, 460px"
          className="sw-decoration-image"
        />
      </div>

      {/* Center */}
      <section className="sw-login-center">
        <div className="sw-login-card">
          {/* Top ornament */}
          <div className="sw-ribbon sw-ribbon-top">
            <Image
              src={`${AUTH}/decorations/burgundy-ribbon.webp`}
              alt=""
              fill
              sizes="180px"
              className="sw-ribbon-image"
            />
          </div>

          <div className="sw-login-content">
            <p className="sw-login-eyebrow">
              WELCOME TO
            </p>

            <h1 className="sw-login-title">
              Nana World
            </h1>

            <p className="sw-login-description">
              A little world filled with love,
              sweet memories, and beautiful surprises.
            </p>

            <div className="sw-login-divider" aria-hidden="true">
              <span />
              <span className="sw-login-heart">♡</span>
              <span />
            </div>

            <LoginForm />

            <p className="sw-login-note">
              Only someone special holds the key to this world.
            </p>
          </div>

          {/* Bottom ornament */}
          <div className="sw-ribbon sw-ribbon-bottom">
            <Image
              src={`${AUTH}/decorations/burgundy-ribbon.webp`}
              alt=""
              fill
              sizes="180px"
              className="sw-ribbon-image"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
