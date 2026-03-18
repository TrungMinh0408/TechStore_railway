import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Modal, message, Avatar } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import accountApi from "../../api/accountApi";

const AccountList = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await accountApi.getAll();
            setUsers(res.data.users);
        } catch (error) {
            message.error("Không thể tải danh sách");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleDelete = (id) => {
        Modal.confirm({
            title: "Xác nhận xóa?",
            content: "Dữ liệu liên quan đến chi nhánh cũng sẽ bị xóa.",
            onOk: async () => {
                try {
                    await accountApi.delete(id);
                    message.success("Đã xóa");
                    fetchUsers();
                } catch (error) { message.error("Lỗi khi xóa"); }
            },
        });
    };

    const columns = [
        {
            title: "Avatar",
            dataIndex: "avatar",
            render: (src) => <Avatar src={src} size="large" />,
        },
        { title: "Họ tên", dataIndex: "name", key: "name" },
        { title: "Email", dataIndex: "email", key: "email" },
        {
            title: "Vai trò",
            dataIndex: "role",
            render: (role) => <Tag color="blue">{role.toUpperCase()}</Tag>
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            render: (active) => <Tag color={active ? "green" : "red"}>{active ? "Đang hoạt động" : "Khóa"}</Tag>,
        },
        {
            title: "Thao tác",
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => navigate(`/admin/accounts/view/${record._id}`)} />
                    <Button icon={<EditOutlined />} type="primary" onClick={() => navigate(`/admin/accounts/update/${record._id}`)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record._id)} />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                <h2>Quản lý tài khoản</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/admin/accounts/create")}> Thêm mới </Button>
            </div>
            <Table columns={columns} dataSource={users} rowKey="_id" loading={loading} />
        </div>
    );
};

export default AccountList;