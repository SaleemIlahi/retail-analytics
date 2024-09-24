import { useId } from "react";
const TableComponent = ({
  data,
  header,
  sort,
  sort_type,
  active_sort,
  setSort,
}) => {
  const id = useId();
  return (
    <table>
      <thead>
        <tr>
          {header?.map((o, i) => (
            <th
              key={o.id}
              onClick={(e) =>
                o.sort &&
                setSort(
                  o.id,
                  sort_type === "desc"
                    ? "asc"
                    : "desc"
                )
              }
            >
              <span>{o.name}</span>
              {o.sort && sort === o.id && (
                <span>
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/25/25243.png"
                    alt="arrow"
                    style={{ width: "10px" }}
                  />
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data?.map((row, index) => (
          <tr key={`${id}-${index}`}>
            <td>{row.formatted_order_date}</td>
            <td>{row.user_name}</td>
            <td>{row.city}</td>
            <td>{row.state}</td>
            <td>{row.category_name}</td>
            <td>{row.product_name}</td>
            <td>{row.quantity}</td>
            <td>
              <span>₹</span>
              {Number(row.price).toLocaleString()}
            </td>
            <td>
              <span>₹</span>
              {Number(row.total_amount).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableComponent;
