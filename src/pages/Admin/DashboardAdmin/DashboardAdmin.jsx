import React from "react";
import s from "./DashboardAdmin.module.css";
import { Button, Divider, Flex, Radio } from "antd";
import {
  DropboxOutlined,
  ShoppingCartOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Space, Table, Tag } from 'antd';
import { useNavigate } from "react-router-dom";

const DashboardAdmin = () => {
  const navigate = useNavigate();

  const dataOrder = [
    { name: "Jan", order: 60 },
    { name: "Feb", order: 30 },
    { name: "Mar", order: 20 },
    { name: "Apr", order: 27 },
    { name: "May", order: 18 },
    { name: "Jun", order: 23 },
    { name: "Jul", order: 34 },
    { name: "Aug", order: 32 },
    { name: "Sep", order: 28 },
    { name: "Oct", order: 31 },
    { name: "Nov", order: 29 },
    { name: "Dec", order: 36 },
  ];
  const dataUser = [
    { name: "Jan", user: 10 },
    { name: "Feb", user: 20 },
    { name: "Mar", user: 22 },
    { name: "Apr", user: 27 },
    { name: "May", user: 18 },
    { name: "Jun", user: 13 },
    { name: "Jul", user: 34 },
    { name: "Aug", user: 12 },
    { name: "Sep", user: 28 },
    { name: "Oct", user: 11 },
    { name: "Nov", user: 23 },
    { name: "Dec", user: 11 },
  ];
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      render: (_, { tags }) => (
        <>
          {tags.map((tag) => {
            let color = tag.length > 5 ? 'geekblue' : 'green';
            if (tag === 'loser') {
              color = 'volcano';
            }
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a>Deactive</a>
          <a>Active</a>
        </Space>
      ),
    },
  ];
  const data = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
      tags: ['Employee'],
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
      tags: ['Employee'],
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sydney No. 1 Lake Park',
      tags: ['Employee'],
    },
  ];  
  return (
    <div className={s['dashboard-container']}>
      <h1 className={s['title-dashboard']}>Dashboard:</h1>
      <div className={s['set-button-date']}>
        <Radio.Group size="large">
          <Radio.Button className={s['button-date-choose']}> Năm</Radio.Button>
          <Radio.Button className={s['button-date']}>Tháng</Radio.Button>
          <Radio.Button className={s['button-date']}>Tuần</Radio.Button>
        </Radio.Group>
      </div>

      <div className={s['dashboard-stats-container']}>
        <div className={s['dashboard-stat-card']} onClick={() => navigate("/admin/orders")}>
          <div className={s['dashboard-stat-info']}>
            <div style={{ display: "flex" }}>
              <ShoppingCartOutlined className={s['dashboard-stat-icon']} />
              <h2 style={{ marginLeft: "20px" }}>Income</h2>
            </div>
            <p className={s['dashboard-stat-value']}>7.450.000 VND</p>
            <p className={s['dashboard-stat-change.dashboard-positive']}>Tình trạng: ⬆ 11.01%</p>
          </div>
        </div>
        <div className={s['dashboard-stat-card']} onClick={() => navigate("/admin/orders")}>
          <div className={s['dashboard-stat-info']}>
            <div style={{ display: "flex" }}>
              <DropboxOutlined className={s['dashboard-stat-icon']} />
              <h2 style={{ marginLeft: "20px" }}>Orders</h2>
            </div>
            <p className={s['dashboard-stat-value']}>559 Đơn hàng</p>
            <p className={s['dashboard-stat-change.dashboard-positive']}>Tình trạng: ⬇ 9.05%</p>
          </div>
        </div>
        <div className={s['dashboard-stat-card']} onClick={() => navigate("/admin/users")}>
          <div className={s['dashboard-stat-info']}>
            <div style={{ display: "flex" }}>
              <UsergroupAddOutlined className={s['dashboard-stat-icon']} />
              <h2 style={{ marginLeft: "20px" }}>Users</h2>
            </div>
            <p className={s['dashboard-stat-value']}>12 User mới - 321 Visiters</p>
            <p className={s['dashboard-stat-change.dashboard-positive']}>Tình trạng: ⬇ 9.05%</p>
          </div>
        </div>
      </div>

      <div className={s['chart-container']}>
        <div style={{ width: "49%" }}>
          <h3 style={{ marginLeft: "50px" }}>Sale tháng 2/2025</h3>
          <div className="bar-chart">
            <ResponsiveContainer className="chart" height={300}>
              <LineChart
                width={600}
                height={300}
                data={dataOrder}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="order"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ width: "49%" }}>
          <h3 style={{ marginLeft: "50px" }}>Visiters trong tháng 2/2025</h3>
          <div className="bar-chart">
            <ResponsiveContainer className="chart" height={300}>
              <LineChart
                width={600}
                height={300}
                data={dataUser}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="user"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={s['target-container']}>
        <h3>Bảng thống kê nhân viên</h3>
        <Table columns={columns} dataSource={data} />;
      </div>
    </div>
  );
};

export default DashboardAdmin;
