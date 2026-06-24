import HomeAhorroSummary from '../components/home/HomeAhorroSummary';
import HomeDisponibleSummary from '../components/home/HomeDisponibleSummary';
import HomeMetasSummary from '../components/home/HomeMetasSummary';
import HomeObjectivesSection from '../components/home/HomeObjectivesSection';
import HomePatrimonioSummary from '../components/home/HomePatrimonioSummary';
import HomeProjectionSection from '../components/home/HomeProjectionSection';

export default function Home() {
  return (
    <div className="app-page app-page--home">
      <h2 className="app-page__title">Inicio</h2>
      <p className="app-page__caption app-page__caption--home">
        Panel financiero · disponible, patrimonio, proyección y objetivos
      </p>

      <HomeDisponibleSummary />
      <HomePatrimonioSummary />
      <HomeProjectionSection />
      <HomeAhorroSummary />
      <HomeMetasSummary />
      <HomeObjectivesSection />
    </div>
  );
}
