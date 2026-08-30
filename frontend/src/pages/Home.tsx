import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleTryNow = (index:string) => {
    navigate('/'+index);
  };

  return (
    <div className="container py-10 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Legal Aid</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
        Legal Aid is a platform designed to make the Indian legal system easy to understand and use. It provides:
         </p>
      </section>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Legal Advice/QAs</CardTitle>
            <CardDescription>Question and answers</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Trusted and accurate information based on real laws.
            .</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Query Searches:</CardTitle>
            <CardDescription>A smart search bar to find answers about IPC, legal issues, and community questions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Process and analyze data in real-time with our advanced algorithms.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning About Laws</CardTitle>
            <CardDescription>Learn about IPC </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Helps people learn their rights and legal solutions in a simple way.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <section className="text-center space-y-4">
        <h2 className="text-3xl font-semibold">Ask a question</h2>
        <div className="space-x-4">
          <Button size="lg" onClick={handleRegister}>Join Us</Button>
          <Button size="lg" variant="outline" onClick={handleLogin}>Login</Button>
        </div>
      </section>

      {/* Image-Text Sections */}
      <section className="flex flex-col md:flex-row items-center gap-8 m-4">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold">Query Search</h2>
          <p className="text-muted-foreground">
            <ul>
        <li>Users can easily search for legal articles, judgments, or laws on various topics.
         </li><li> Search by keywords, case names, or specific citations to find relevant case laws or legal information.
         </li>
         </ul>
          </p>
          <Button onClick={()=>handleTryNow('search')}>Try Now</Button>
        </div>
        <div className="flex-1">
          <img
            src="/search.png"
            alt="Search"
            className="rounded-lg shadow-lg w-full h-auto"
          />
        </div>
      </section>

      <section className="flex flex-col md:flex-row-reverse items-center gap-8 m-4">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold">Legal laws & Rights</h2>
          <p className="text-muted-foreground">
          Users can learn about laws and rights in simple, easy-to-understand language.
Helps users gain insight into legal principles and understand complex terms without confusion.

          </p>
          <Button onClick={()=>handleTryNow('learn')}>Try Now</Button>
        </div>
        <div className="flex-1">
          <img
            src="/learn.png"
            alt="Legal laws & Rights"
            className="rounded-lg shadow-lg w-full h-auto"
          />
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-center gap-8 m-4">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold">Community Question/Answers</h2>
          <p className="text-muted-foreground">
            Communit support to ask question and aswer.
          </p>
          <Button onClick={()=>handleTryNow('community')}>Try Now</Button>
        </div>
        <div className="flex-1">
          <img
            src="/community.png"
            alt="Community Question/Answers"
            className="rounded-lg shadow-lg w-full h-auto"
          />
        </div>
      </section>
    </div>
  )
}
