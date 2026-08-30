import { Input } from "@/components/ui/input";
import NetworkService from "@/NetworkService";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface IPCSection {
  id: number;
  section_number: string;
  description: string;
  punishment: string;
  offense: string;
}

interface CommunityQuestion {
  id: number;
  title: string;
  content: string;
  created_at: string;
  likes: number;
  dislikes: number;
  user_id: string;
}

interface CommunityAnswer {
  id: number;
  content: string;
  created_at: string;
  likes: number;
  dislikes: number;
  user_id: string;
}

interface SemanticMatch {
  content: string;
  metadata: Record<string, any>;
}

export function SearchPage() {
  const [perfectMatch, setPerfectMatch] = useState("");
  const [ipcResults, setIPCResults] = useState<IPCSection[]>([]);
  const [questionResults, setQuestionResults] = useState<CommunityQuestion[]>([]);
  const [answerResults, setAnswerResults] = useState<CommunityAnswer[]>([]);
  
  // New States for RAG AI Search
  const [aiAnswer, setAiAnswer] = useState("");
  const [ragMatches, setRagMatches] = useState<SemanticMatch[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getSearchResults = () => {
    if (searchQuery.length < 3) {
      setPerfectMatch("");
      setIPCResults([]);
      setQuestionResults([]);
      setAnswerResults([]);
      setAiAnswer("");
      setRagMatches([]);
      return;
    }

    setIsLoading(true);
    const network = new NetworkService();

    // 1. Traditional Database Search Call
    network.request(
      'ipc/search', 
      'POST', 
      { search: searchQuery }, 
      {}, 
      (error: any, responseData: any) => {
        if (!error && responseData) {
          setPerfectMatch(responseData.aisearch || "");
          setIPCResults(responseData.ipcs || []);
          setQuestionResults(responseData.questions || []);
          setAnswerResults(responseData.answers || []);
        }
      }
    );

    // 2. RAG AI Semantic Search Call
    network.request(
      'ipc/semantic-search/',
      'POST',
      { query: searchQuery },
      {},
      (error: any, responseData: any) => {
        setIsLoading(false);
        if (error) {
          console.error("Error fetching RAG semantic search:", error);
          return;
        }
        if (responseData) {
          setAiAnswer(responseData.ai_answer || "");
          setRagMatches(responseData.semantic_matches || []);
        }
      }
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length < 3) {
      setPerfectMatch("");
      setIPCResults([]);
      setQuestionResults([]);
      setAnswerResults([]);
      setAiAnswer("");
      setRagMatches([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.length >= 3) {
      getSearchResults();
    }
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const toggleExpand = (itemType: string, id: number) => {
    const key = id === 0 ? itemType : `${itemType}-${id}`;
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleQuestionClick = (id: number) => {
    navigate(`/question/${id}`);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      {/* Search Input Box */}
      <div className="flex w-full justify-center">
        <div className="flex justify-center mt-2 w-full max-w-2xl gap-2 items-center">
          <Input 
            placeholder='Type query & press Enter or click search icon...' 
            className='rounded-md text-base p-3' 
            value={searchQuery} 
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          <Search 
            size={36} 
            className={`cursor-pointer text-blue-600 hover:text-blue-800 ${isLoading || searchQuery.length < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !isLoading && searchQuery.length >= 3 && getSearchResults()} 
          />
        </div>
      </div>

      {isLoading && (
        <div className="text-center text-gray-500 font-medium py-4">
          Searching legal databases & generating AI insights...
        </div>
      )}

      {/* RAG AI Answer Banner */}
      {aiAnswer && (
        <Card className="border-green-200 bg-green-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800 text-lg flex items-center gap-2">
              🤖 AI Legal Assistant Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-900 whitespace-pre-line leading-relaxed text-sm md:text-base">
              {expandedItems['ai-answer'] ? aiAnswer : truncateText(aiAnswer, 300)}
            </p>
            {aiAnswer.length > 300 && (
              <button 
                className="text-green-700 font-semibold hover:underline mt-2 text-sm"
                onClick={() => toggleExpand('ai-answer', 0)}>
                {expandedItems['ai-answer'] ? 'Show Less' : 'Read Full Advice'}
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legacy Perfect Match */}
      {perfectMatch && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <p className="text-blue-900">{expandedItems['perfect-match'] ? perfectMatch : truncateText(perfectMatch)}</p>
            {perfectMatch.length > 200 && (
              <button 
                className="text-blue-600 hover:underline mt-1 text-sm"
                onClick={() => toggleExpand('perfect-match', 0)}>
                {expandedItems['perfect-match'] ? 'Show Less' : 'View More'}
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* RAG Matched IPC Contexts */}
      {ragMatches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Contextual Legal Sections</h3>
          {ragMatches.map((item, idx) => (
            <Card key={idx} className="bg-white border-gray-200">
              <CardContent className="pt-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {expandedItems[`rag-${idx}`] ? item.content : truncateText(item.content, 250)}
                </pre>
                {item.content.length > 250 && (
                  <button 
                    className="text-blue-600 text-sm hover:underline mt-1"
                    onClick={() => toggleExpand('rag', idx)}>
                    {expandedItems[`rag-${idx}`] ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* IPC Sections List */}
      {ipcResults.map((item: IPCSection) => (
        <Card key={item.id} className="w-full">
          <CardHeader>
            <CardTitle>{item.section_number}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardDescription>
                <h4 className="text-md font-semibold text-gray-800">Description</h4>
                <p>{expandedItems[`ipc-desc-${item.id}`] ? item.description : truncateText(item.description)}</p>
                {item.description.length > 200 && (
                  <button 
                    className="text-blue-500 hover:underline text-sm mt-1"
                    onClick={() => toggleExpand('ipc-desc', item.id)}>
                    {expandedItems[`ipc-desc-${item.id}`] ? 'Show Less' : 'View More'}
                  </button>
                )}
              </CardDescription>

              <CardDescription>
                <h4 className="text-md font-semibold text-gray-800">Offence</h4>
                <p>{expandedItems[`ipc-off-${item.id}`] ? item.offense : truncateText(item.offense)}</p>
                {item.offense.length > 200 && (
                  <button 
                    className="text-blue-500 hover:underline text-sm mt-1"
                    onClick={() => toggleExpand('ipc-off', item.id)}>
                    {expandedItems[`ipc-off-${item.id}`] ? 'Show Less' : 'View More'}
                  </button>
                )}
              </CardDescription>
            </div>

            <CardDescription>
              <h4 className="text-md font-semibold text-gray-800">Punishment</h4>
              <p>{expandedItems[`ipc-pun-${item.id}`] ? item.punishment : truncateText(item.punishment)}</p>
              {item.punishment.length > 200 && (
                <button 
                  className="text-blue-500 hover:underline text-sm mt-1"
                  onClick={() => toggleExpand('ipc-pun', item.id)}>
                  {expandedItems[`ipc-pun-${item.id}`] ? 'Show Less' : 'View More'}
                </button>
              )}
            </CardDescription>
          </CardContent>
        </Card>
      ))}

      {/* Community Questions List */}
      {questionResults.map((item: CommunityQuestion) => (
        <Card key={item.id} className="w-full">
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <CardDescription>
              {expandedItems[`question-${item.id}`] ? item.content : truncateText(item.content)}
              {item.content.length > 200 && (
                <button 
                  className="text-blue-500 hover:underline text-sm ml-2"
                  onClick={() => toggleExpand('question', item.id)}>
                  {expandedItems[`question-${item.id}`] ? 'Show Less' : 'View More'}
                </button>
              )}
            </CardDescription>
            <div className="text-xs text-gray-500 space-x-4">
              <span>Asked by: {item.user_id || "Anonymous User"}</span>
              <span>Asked on: {new Date(item.created_at).toLocaleString()}</span>
            </div>
          </CardContent>
          <CardFooter>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700" onClick={() => handleQuestionClick(item.id)}>
              View Answers
            </button>
          </CardFooter>
        </Card>
      ))}

      {/* Community Answers List */}
      {answerResults.map((item: CommunityAnswer) => (
        <Card key={item.id} className="w-full">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Community Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <CardDescription>
              {expandedItems[`answer-${item.id}`] ? item.content : truncateText(item.content)}
              {item.content.length > 200 && (
                <button 
                  className="text-blue-500 hover:underline text-sm ml-2"
                  onClick={() => toggleExpand('answer', item.id)}>
                  {expandedItems[`answer-${item.id}`] ? 'Show Less' : 'View More'}
                </button>
              )}
            </CardDescription>
            <div className="text-xs text-gray-500 space-x-4">
              <span>Answered by: {item.user_id || "Anonymous User"}</span>
              <span>Answered on: {new Date(item.created_at).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}