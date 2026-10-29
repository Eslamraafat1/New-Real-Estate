import { ListingsShell, listingsMetadata } from "@/components/listings/ListingsShell";

export async function generateMetadata({ params }: PageProps<"/[lang]/rent">) {
  return listingsMetadata((await params).lang, "rent");
}

export default async function Page({ params }: PageProps<"/[lang]/rent">) {
  return <ListingsShell langParam={(await params).lang} kind="rent" />;
}
