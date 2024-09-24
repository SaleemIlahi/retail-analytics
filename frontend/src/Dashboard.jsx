// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { products } from "./dummy"; // Import dummy data
import FilterComponent from "./Filter";
import TableComponent from "./Table";
import S from "./style/dashboard.module.css";
import IndiaMap from "./IndiaMap";
import Graph from "./Graph";

const Dashboard = () => {
  const [filteredData, setFilteredData] = useState({
    pageno: 1,
    sort: "order_date",
    sort_type: "desc",
    active_sort: "order_date"
  });
  const [tableData, setTableData] = useState([]);
  const [fullCount, setFullCount] = useState(1);

  const handleFilterChange = (filters) => {
    let filtered = products;

    if (filters.dateRange) {
      const { startDate, endDate } = filters.dateRange;
      filtered = filtered.filter((product) => {
        const createdAt = new Date(product.created_at);
        return createdAt >= startDate && createdAt <= endDate;
      });
    }

    setFilteredData(filtered);
  };

  const analyticReportFetch = async () => {
    let paramsString = "";
    Object.entries(filteredData).forEach(([k, v], i) => {
      if (i === 0) {
        paramsString += `${k}=${v}`;
      } else {
        paramsString += `&${k}=${v}`;
      }
    });
    const response = await fetch(
      `http://127.0.0.1:8000/analytics?${paramsString}`
    );
    let result = await response.json();
    if (result.status === 200) {
      setTableData(() => ({
        data: result.data,
        stateData: result.state,
        header: result.table_header,
        graph: result.graph,
      }));
      setFullCount(() => result.full_count);
    }
  };

  useEffect(() => {
    analyticReportFetch();
  }, [filteredData]);

  return (
    <div className={S.dashboard_container}>
      <div className={S.dashboard_layout}>
        {/* <div className={S.dashboard_filter}>
          <FilterComponent onFilterChange={handleFilterChange} />
        </div> */}
        <div className={S.dashboard_analytic}>
          <div className={S.dashboard_analytic_container_graph}>
            <div className={S.dashboard_analytic_graph_canavas}>
              <Graph data={tableData.graph} />
            </div>
            <div className={S.dashboard_analytic_graph_canavas}>
              {tableData?.stateData?.length > 0 && (
                <IndiaMap stateData={tableData.stateData} />
              )}
            </div>
          </div>
          <div className={S.dashboard_analytic_container_table_pagination}>
            {filteredData.pageno > 1 && (
              <div
                className={S.pagination_btn}
                onClick={() => {
                  setFilteredData((prev) => ({ ...prev, pageno: prev.pageno === 1 ? prev.pageno : prev.pageno - 1 }));
                  analyticReportFetch();
                }}
              >
                Prev
              </div>
            )}

            <div className={S.pagination_no}>{filteredData.pageno}</div>
            {filteredData.pageno <= fullCount && (
              <div
                className={S.pagination_btn}
                onClick={() => {
                  setFilteredData((prev) => ({ ...prev, pageno: prev.pageno + 1 }));
                  analyticReportFetch();
                }}
              >
                Next
              </div>
            )}
          </div>
          <div className={S.dashboard_analytic_container_table}>
            <TableComponent
              {...tableData}
              {...filteredData}
              setSort={(v, v2) =>
                setFilteredData((prev) => ({ ...prev, sort: v,active_sort:v,sort_type:v2 }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
