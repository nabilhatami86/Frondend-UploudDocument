import Dropdown from 'react-bootstrap/Dropdown';
import React, {useEffect, useState} from 'react';
import './style-document.css';
import {Link, useNavigate} from 'react-router-dom';
import {Button, Table, Form} from 'react-bootstrap';
import axios from 'axios';
import '../../routes/index';
import RenameDocumentModal from './RenameDocumentModal';

const ListDocument = () => {
    const [documents, setDocuments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    // const [selectedFile, setSelectedFile] = useState(null);
    // const [categoryId, setCategoryId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true)
    const [selectedDocument, setSelectedDocument] = useState(false);
    // const [email, setEmail] = useState('');

    // const Navigate = useNavigate()
    const token = localStorage.getItem('token')
    
    const filterCategory = (category)=>{
        axios
        .get(`http://localhost:5000/list?category=${category}`)
        .then(response => {
            setDocuments(response.data);
            setLoading(false)
        })
        .catch(error => {
            console.error('There was an error fetching the documents!', error);
        });
    }

    useEffect(() => {
        axios
            .get('http://localhost:5000/list')
            .then(response => {
                setDocuments(response.data);
                setLoading(false)
            })
            .catch(error => {
                console.error('There was an error fetching the documents!', error);
            });
    }, []);

    const deleteDocuments = (id) => {

        const userRole = localStorage.getItem('role');

        if(userRole === 'admin' || userRole === 'staff') {
        axios
            .delete(`http://localhost:5000/delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(() => {
                axios
                    .get('http://localhost:5000/list')
                    .then(response => {
                        setDocuments(response.data);
                    })
                    .catch(error => {
                        console.error('There was an error fetching the documents!', error);
                    });
            })
            .catch(error => {
                console.error(error)
            })
        } else {
            alert('Anda Tidak Memiliki Akses Untuk Menghapus Dokument')
        }
        
    }

    const handleShowRenameModal = (id) => {
        const userRole = localStorage.getItem('role');
        if (userRole ==='admin' || userRole === 'staff') {
        setSelectedDocument(id);
        setShowModal(true);
        } else {
            alert('Anda Tidak Memiliki Akses Untuk Melakukan Rename')
        }
    };
    const handleCloseModal = () => setShowModal(false);

    const downloadDocument = (id, name) => {
        axios({
            url: `http://localhost:5000/download/${id}`,
            method: 'GET',
            responseType: 'blob'
        })
        .then(response => {
            const urlName = name;
            const parts = urlName.split('/');
            const filename = parts[parts.length - 1];
            const extension = filename.split('.').pop();
            const basename = filename.substring(0, filename.lastIndexOf('.'));
            const newFilename = `${basename}.${extension}`;
    
            const url = window.URL.createObjectURL(new Blob([response.data]));
    

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', newFilename);
            document.body.appendChild(link);
            link.click();
    
            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error downloading document:', error);
            alert('Failed to download document. Please try again later.');
        });
    };
    

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredDocuments = documents.filter(document =>
        document.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container py-5">
            <div className="contenNav mb-5">
                <ul className="nav justify-content-center">
                    <li className="nav-item">
                        <Link className="nav-link active" aria-current="page" onClick={()=>filterCategory('Perpres')}><small>Pepres</small></Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link active" aria-current="page" onClick={()=>filterCategory('Notulensi')}><small>Notulensi</small></Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link active" aria-current="page" onClick={()=>filterCategory('Nota Dinas')}><small>Nota Dinas</small></Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link active" aria-current="page" onClick={()=>filterCategory('Undangan')}><small>Undangan</small></Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link active" aria-current="page" onClick={()=>filterCategory('Surat Tugas')}><small>Surat Tugas</small></Link>
                    </li>
                </ul>
                <input type="text" className="form-control" placeholder="Search" value={searchTerm} onChange={handleSearch} />
            </div>

            <Table
                hover="hover" responsive="responsive" className="table table-sm custom-table">
                <thead >
                    <tr>
                        <th>No</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        loading
                            ? (<div>Loading...</div>)
                            : filteredDocuments.map((document, index) => (
                                <tr key={document.id}>
                                    <td className='no-col'>{index + 1}</td>
                                    <td>
                                        <a href={document.document} className='document-name text-decoration-none' target="_blank" rel="noopener noreferrer">{document.name}</a>
                                    </td>
                                    <td className='category-col'>
                                        {
                                            document.Category
                                                ? document.Category.name
                                                : "N/A"
                                        }
                                    </td>
                                    <td className='date-col'>
                                        {document.tanggal}
                                    </td>
                                    <td className='action-col '>
                                        <Dropdown>
                                        <Dropdown.Toggle variant="danger" id="dropdown-basic" className="custom-dropdown">
                                                Action
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => handleShowRenameModal(document.id)}>Rename</Dropdown.Item>
                                                <Dropdown.Item onClick={() => downloadDocument(document.id, document.document)}>Download</Dropdown.Item>
                                                <Dropdown.Item onClick={() => deleteDocuments(document.id)}>Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))
                    }
                </tbody>
            </Table>
            {
                selectedDocument && (
                    <RenameDocumentModal
                        show={showModal}
                        handleClose={handleCloseModal}
                        documentId={selectedDocument}
                        token={token}
                        setDocuments={setDocuments}/>
                )
            }
        </div>
    );
};

export default ListDocument;
