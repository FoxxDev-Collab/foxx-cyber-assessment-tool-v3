import React from 'react';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with modern design */}
      <section className="pt-20 pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
              Strengthen Your <span className="text-primary">Security Posture</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our assessment tool helps technical teams identify vulnerabilities, 
              meet compliance requirements, and implement effective security controls.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-10 justify-center">
              <Link 
                href="/assessment" 
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-medium text-primary-foreground hover:bg-primary/90 shadow-md transition-all duration-200 transform hover:-translate-y-1"
              >
                Start Assessment
              </Link>
              <a 
                href="https://foxxcyber.com/contact" 
                target="_blank"
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center rounded-lg border-2 border-primary px-8 py-4 text-base font-medium text-primary hover:bg-accent hover:text-accent-foreground transition-all duration-200"
              >
                Schedule a Consultation
              </a>
            </div>
          </div>
          
          {/* Hero image/illustration */}
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="bg-accent/50 rounded-2xl p-6 backdrop-blur-sm border border-border">
              <div className="grid grid-cols-3 gap-4 p-4">
                <div className="col-span-3 md:col-span-2 bg-card rounded-xl shadow-sm p-6 border border-border">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-xl text-card-foreground">Security Assessment Dashboard</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Overall Score</span>
                      <span className="font-medium text-foreground">72%</span>
                    </div>
                    <div className="w-full bg-accent rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full w-8/12"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-accent p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground">Controls Implemented</div>
                        <div className="text-2xl font-bold text-foreground">28/42</div>
                      </div>
                      <div className="bg-accent p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground">Risk Level</div>
                        <div className="text-2xl font-bold text-chart-2">Medium</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-3 md:col-span-1 space-y-4">
                  <div className="bg-card rounded-xl shadow-sm p-6 border border-border h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-chart-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-xl text-card-foreground">Compliance</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-muted-foreground text-sm">
                        <svg className="w-4 h-4 mr-2 text-chart-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        NIST 800-53
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <svg className="w-4 h-4 mr-2 text-chart-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        ISO 27001
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <svg className="w-4 h-4 mr-2 text-chart-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        CMMC 2.0
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section - with modern cards */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-card-foreground">How It Works</h2>
            <div className="mt-2 w-16 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl bg-card p-8 shadow-lg border border-border transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-card-foreground">Complete Assessment</h3>
              <p className="text-muted-foreground">Answer questions about your security controls and practices using our intuitive assessment interface.</p>
            </div>
            
            <div className="rounded-xl bg-card p-8 shadow-lg border border-border transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-chart-1/10 flex items-center justify-center mb-6 text-chart-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-card-foreground">Review Results</h3>
              <p className="text-muted-foreground">Get detailed feedback on your security strengths and gaps with visual analytics and prioritized recommendations.</p>
            </div>
            
            <div className="rounded-xl bg-card p-8 shadow-lg border border-border transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-chart-3/10 flex items-center justify-center mb-6 text-chart-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-card-foreground">Implement Improvements</h3>
              <p className="text-muted-foreground">Follow actionable recommendations to strengthen your security posture and track your progress over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 px-4 bg-accent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">Key Features</h2>
            <div className="mt-2 w-16 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow h-full border border-border">
              <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4 text-chart-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-card-foreground">Risk Assessments</h3>
              <p className="text-muted-foreground">Identify and evaluate potential risks to your organization&apos;s information security infrastructure.</p>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow h-full border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-card-foreground">Compliance Frameworks</h3>
              <p className="text-muted-foreground">Assess your organization against NIST, ISO 27001, and other security compliance frameworks.</p>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow h-full border border-border">
              <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center mb-4 text-chart-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-card-foreground">Reports & Documentation</h3>
              <p className="text-muted-foreground">Generate detailed reports and documentation for audit and review purposes with easy export options.</p>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow h-full border border-border">
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4 text-chart-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-card-foreground">Gap Analysis</h3>
              <p className="text-muted-foreground">Identify gaps in your security controls and receive prioritized recommendations for improvement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-card-foreground">Trusted by Security Professionals</h2>
            <div className="mt-2 w-16 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="bg-accent rounded-xl p-8 shadow-md border border-border">
                <div className="flex items-center mb-4">
                  <div className="flex text-chart-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-card-foreground italic mb-6">
                  {index === 0 && '"This tool has transformed our security posture assessment process. The visualizations make it easy to identify gaps and prioritize improvements."'}
                  {index === 1 && '"The compliance mapping feature saved us countless hours of manual work during our ISO 27001 certification process."'}
                  {index === 2 && '"As a security consultant, this tool helps me deliver more value to my clients by providing clear, actionable recommendations."'.replace("'", "&apos;")}
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {index === 0 && 'JD'}
                    {index === 1 && 'JS'}
                    {index === 2 && 'AJ'}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-card-foreground">
                      {index === 0 && 'Jane Doe'}
                      {index === 1 && 'John Smith'}
                      {index === 2 && 'Amy Johnson'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {index === 0 && 'CISO, Tech Company'}
                      {index === 1 && 'IT Director, Financial Services'}
                      {index === 2 && 'Cybersecurity Consultant'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl bg-primary p-12 shadow-xl text-primary-foreground">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Need Expert Guidance?</h2>
              <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Our security experts can help you interpret assessment results and develop a tailored 
                cybersecurity strategy for your organization. Schedule a consultation today.
              </p>
              <a 
                href="https://foxxcyber.com/contact" 
                target="_blank"
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center rounded-lg bg-card px-8 py-4 text-base font-medium text-primary hover:bg-accent shadow-md transition-all duration-200 transform hover:-translate-y-1"
              >
                Contact FoxxCyber
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;