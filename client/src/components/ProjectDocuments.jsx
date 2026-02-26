import React, { useState } from 'react';
import styled from 'styled-components';
import { Description, Add, Launch, Delete } from '@mui/icons-material';
import { CircularProgress, IconButton, Tooltip } from '@mui/material';
import { useDispatch } from 'react-redux';
import { updateProject } from '../api';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { openSnackbar } from '../redux/snackbarSlice';
import { GalaxyButton } from './CreativeComponents';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.5s ease-out;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const DocumentCard = styled.a`
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.soft};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    border-color: ${({ theme }) => theme.primary};
  }
`;

const DocIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ theme }) => theme.primary + '15'};
  color: ${({ theme }) => theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DocTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DocDate = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
  margin: 0;
`;

const AddDocumentForm = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border: 1px dashed ${({ theme }) => theme.primary};
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.soft};
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const CancelButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.textSoft};
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  &:hover {
    background: ${({ theme }) => theme.soft};
    color: ${({ theme }) => theme.text};
  }
`;

const ProjectDocuments = ({ project, setProject, token }) => {
    const dispatch = useDispatch();
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newDocName, setNewDocName] = useState("");
    const [newDocLink, setNewDocLink] = useState("");
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleAddDocument = async () => {
        if (!newDocName.trim() || (!newDocLink.trim() && !file)) {
            dispatch(openSnackbar({ message: "Please provide a document name and either a link or select a file", type: "error" }));
            return;
        }

        setLoading(true);
        try {
            let finalLink = newDocLink;

            if (file) {
                const fileName = new Date().getTime() + "_" + file.name;
                const storageRef = ref(storage, 'projects/documents/' + fileName);
                const uploadTask = uploadBytesResumable(storageRef, file);

                finalLink = await new Promise((resolve, reject) => {
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(Math.round(progress));
                        },
                        (error) => {
                            reject(error);
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        }
                    );
                });
            }

            const newDocument = {
                name: newDocName,
                link: finalLink,
                uploadedAt: new Date().toISOString()
            };

            const updatedDocuments = [...(project.documents || []), newDocument];

            const res = await updateProject(project._id, { documents: updatedDocuments }, token);

            setProject(res.data.project);

            setNewDocName("");
            setNewDocLink("");
            setFile(null);
            setUploadProgress(0);
            setShowAddForm(false);
            dispatch(openSnackbar({ message: "Document added successfully", type: "success" }));
        } catch (err) {
            console.error(err);
            dispatch(openSnackbar({ message: err.response?.data?.message || err.message, type: "error" }));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDocument = async (e, index) => {
        e.preventDefault(); // Prevent opening link
        if (!window.confirm("Are you sure you want to remove this document link?")) return;

        setLoading(true);
        try {
            const updatedDocuments = [...(project.documents || [])];
            updatedDocuments.splice(index, 1);

            const res = await updateProject(project._id, { documents: updatedDocuments }, token);
            setProject(res.data.project);

            dispatch(openSnackbar({ message: "Document removed successfully", type: "success" }));
        } catch (err) {
            dispatch(openSnackbar({ message: err.response?.data?.message || err.message, type: "error" }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <TopBar>
                <Title><Description /> Project Documents</Title>
                <GalaxyButton onClick={() => setShowAddForm(!showAddForm)}>
                    <Add /> Add Document
                </GalaxyButton>
            </TopBar>

            {showAddForm && (
                <AddDocumentForm>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Add New Document</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>Upload a file or provide an external link to Seminar Reports, PPTs, or any other online document (Google Drive, OneDrive, etc.)</p>
                    <Input
                        placeholder="Document Name (e.g. Seminar 1 Report)"
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#aaa' }}>Option 1: Upload a File</span>
                        <Input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                        />
                    </div>

                    <div style={{ textAlign: 'center', color: '#888', fontSize: '12px' }}>OR</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#aaa' }}>Option 2: Provide a Link</span>
                        <Input
                            placeholder="External Link URL (e.g. https://docs.google.com/...)"
                            value={newDocLink}
                            onChange={(e) => setNewDocLink(e.target.value)}
                            disabled={!!file}
                        />
                    </div>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div style={{ width: '100%', backgroundColor: '#333', borderRadius: '4px', height: '6px', marginTop: '10px' }}>
                            <div style={{ width: `${uploadProgress}%`, backgroundColor: '#3b82f6', height: '100%', borderRadius: '4px', transition: 'width 0.2s' }}></div>
                        </div>
                    )}

                    <ActionRow>
                        <CancelButton onClick={() => setShowAddForm(false)}>Cancel</CancelButton>
                        <GalaxyButton onClick={handleAddDocument} disabled={loading} style={{ padding: '8px 24px', fontSize: '14px' }}>
                            {loading ? <CircularProgress size={20} color="inherit" /> : "Save Link"}
                        </GalaxyButton>
                    </ActionRow>
                </AddDocumentForm>
            )}

            {(!project.documents || project.documents.length === 0) && !showAddForm ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '16px' }}>
                    <Description sx={{ fontSize: 48, color: '#666', marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>No documents yet</h3>
                    <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Add links to your PPTs, seminar reports, or project documentation.</p>
                </div>
            ) : (
                <DocumentsGrid>
                    {project.documents?.map((doc, index) => (
                        <DocumentCard key={index} href={doc.link} target="_blank" rel="noopener noreferrer">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <DocIconWrapper>
                                    <Description />
                                </DocIconWrapper>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <Tooltip title="Remove Document">
                                        <IconButton size="small" onClick={(e) => handleDeleteDocument(e, index)} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <IconButton size="small" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'inherit' }}>
                                        <Launch fontSize="small" />
                                    </IconButton>
                                </div>
                            </div>
                            <DocTitle>{doc.name}</DocTitle>
                            <DocDate>Added {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}</DocDate>
                        </DocumentCard>
                    ))}
                </DocumentsGrid>
            )}
        </Container>
    );
};

export default ProjectDocuments;
