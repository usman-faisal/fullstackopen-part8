import { useQuery } from "@apollo/client";
import { ALL_AUTHORS } from "../queries";
import UpdateBirthForm from "./UpdateBirthForm";

const Authors = () => {
  const result = useQuery(ALL_AUTHORS, {
    variables: { genre: "hi" },
  });
  if (result.loading) {
    return <p>Loading..</p>;
  }
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th>Name</th>
            <th>born</th>
            <th>books</th>
          </tr>
          {result.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <UpdateBirthForm />
    </div>
  );
};

export default Authors;
