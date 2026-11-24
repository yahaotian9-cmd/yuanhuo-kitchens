import { Link, Route, Routes } from "react-router-dom";
import { copy } from "./copy";
import { Shell } from "./layout";
import { Admin } from "./pages/Admin";
import { Build } from "./pages/Build";
import { Factory } from "./pages/Factory";
import { Home } from "./pages/Home";
import { Inquiry } from "./pages/Inquiry";
import { Layouts } from "./pages/Layouts";
import { ModelDetail } from "./pages/ModelDetail";
import { Models } from "./pages/Models";
import { Track } from "./pages/Track";
import { useApp, useTitle } from "./state";

function Missing() {
  const { lang } = useApp();
  const text = copy[lang];
  useTitle(text.missing.title);
  return (
    <header className="page-head">
      <div className="wrap">
        <h1>{text.missing.title}</h1>
        <p className="lede">{text.missing.lede}</p>
        <Link className="btn btn-ink" to="/">
          {text.missing.home}
        </Link>
      </div>
    </header>
  );
}

export function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/models" element={<Models />} />
        <Route path="/models/:id" element={<ModelDetail />} />
        <Route path="/build" element={<Build />} />
        <Route path="/workshop" element={<Factory />} />
        <Route path="/layouts" element={<Layouts />} />
        <Route path="/inquiry" element={<Inquiry />} />
        <Route path="/track" element={<Track />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Missing />} />
      </Routes>
    </Shell>
  );
}
