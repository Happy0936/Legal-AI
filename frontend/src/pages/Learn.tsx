import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NetworkService from "@/NetworkService";
import { useEffect, useState } from "react";

interface Item {
  id: number;
  title: string;
  description: string;
  punishment: string;
  section_number: string;
}

export function Learn() {
  const [data, setData] = useState<Item[]>([]);

  useEffect(() => {
    const network = new NetworkService();
    network.request('ipc/getall', 'GET', null, {}, (error: any, responseData: Item[]) => {
      if (error) {
        console.error("Error fetching data:", error);
        return;
      }
      setData(responseData);
    });
  }, []);

  return (
    <div className="flex w-full flex-wrap gap-4">
      {data.map((item: Item) => (
        <Card key={item.id} className="w-full">
          <CardHeader>
            <CardTitle>{item.section_number}</CardTitle>
          </CardHeader>
          <CardContent> 
            <CardDescription>{item.description}</CardDescription>
            <br/>
            <h3 className="text-lg">Punishment</h3>
            <CardDescription>{item.punishment}</CardDescription>
            <br/>
            <h3 className="text-lg">Offense</h3>
            <CardDescription>{item.punishment}</CardDescription>
          </CardContent>
          <CardFooter>
            
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
