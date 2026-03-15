export default function HeroSection() {
  return (
    <section className="text-center pt-8 sm:pt-14 pb-6 sm:pb-8 px-4 sm:px-6 animate-fade-in">
      <h1 
        className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4 leading-tight" 
        style={{ fontFamily: "'Dancing Script', cursive" }}
      >
        Shorten URLs{" "}
        <span className="gradient-text-brand">Instantly</span>
      </h1>
    </section>
  );
}
