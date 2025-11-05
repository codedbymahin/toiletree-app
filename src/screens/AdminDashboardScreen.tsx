import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { ToiletSubmission, Report } from '../types';
import { adminService } from '../services/admin';
import { LoadingSpinner, Button } from '../components';

export const AdminDashboardScreen = () => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'reports' | 'deletions'>('submissions');
  const [submissions, setSubmissions] = useState<ToiletSubmission[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<Array<{
    id: string;
    username: string;
    email?: string;
    deletion_requested_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    if (activeTab === 'submissions') {
      await loadSubmissions();
    } else if (activeTab === 'reports') {
      await loadReports();
    } else if (activeTab === 'deletions') {
      await loadDeletionRequests();
    }
    setLoading(false);
  };

  const loadSubmissions = async () => {
    const { submissions: data, error } = await adminService.getPendingSubmissions();
    
    if (error) {
      Alert.alert('Error', 'Failed to load submissions');
    } else {
      setSubmissions(data);
    }
  };

  const loadReports = async () => {
    const { reports: data, error } = await adminService.getReports();
    
    if (error) {
      Alert.alert('Error', 'Failed to load reports');
    } else {
      setReports(data);
    }
  };

  const loadDeletionRequests = async () => {
    const { requests, error } = await adminService.getDeletionRequests();
    
    if (error) {
      Alert.alert('Error', 'Failed to load deletion requests');
    } else {
      setDeletionRequests(requests);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleApproveSubmission = async (submissionId: string) => {
    Alert.alert(
      'Approve Submission',
      'Are you sure you want to approve this toilet submission?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            const { success, error } = await adminService.approveSubmission(submissionId);
            
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Submission approved!');
              loadSubmissions();
            }
          },
        },
      ]
    );
  };

  const handleRejectSubmission = async (submissionId: string) => {
    // For now, reject without notes since Alert.prompt is iOS-only
    // TODO: Implement cross-platform modal for admin notes
    Alert.alert(
      'Reject Submission',
      'Are you sure you want to reject this submission?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            const { success, error } = await adminService.rejectSubmission(
              submissionId,
              'Rejected by admin'
            );
            
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Submission rejected');
              loadSubmissions();
            }
          },
        },
      ]
    );
  };

  const handleResolveReport = async (reportId: string) => {
    const { success, error } = await adminService.updateReportStatus(reportId, 'resolved');
    
    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('Success', 'Report marked as resolved');
      loadReports();
    }
  };

  const handleDismissReport = async (reportId: string) => {
    const { success, error } = await adminService.updateReportStatus(reportId, 'dismissed');
    
    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('Success', 'Report dismissed');
      loadReports();
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <View className="flex-1 bg-white">
      {/* Tabs */}
      <View className="flex-row border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setActiveTab('submissions')}
          className={`flex-1 py-4 ${
            activeTab === 'submissions' ? 'border-b-2 border-blue-600' : ''
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'submissions' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            Submissions ({submissions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('reports')}
          className={`flex-1 py-4 ${
            activeTab === 'reports' ? 'border-b-2 border-blue-600' : ''
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'reports' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            Reports ({reports.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('deletions')}
          className={`flex-1 py-4 ${
            activeTab === 'deletions' ? 'border-b-2 border-blue-600' : ''
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'deletions' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            Deletions ({deletionRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'submissions' ? (
          // Submissions List
          <View className="p-4">
            {submissions.length > 0 ? (
              submissions.map((submission: any) => (
                <View
                  key={submission.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
                >
                  {submission.photo_url && (
                    <Image
                      source={{ uri: submission.photo_url }}
                      className="w-full h-40 rounded-lg mb-3"
                      resizeMode="cover"
                    />
                  )}
                  <Text className="text-lg font-bold text-gray-800 mb-1">
                    {submission.name}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-2">
                    {submission.address}
                  </Text>
                  <View className="flex-row flex-wrap mb-3">
                    {submission.is_female_friendly && (
                      <View className="flex-row items-center bg-pink-100 px-2 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-pink-700 mr-1">♀️</Text>
                        <Text className="text-pink-700 text-xs font-semibold">Female Friendly</Text>
                      </View>
                    )}
                    {submission.has_water_access && (
                      <View className="flex-row items-center bg-blue-100 px-2 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-blue-700 mr-1">💧</Text>
                        <Text className="text-blue-700 text-xs font-semibold">Water</Text>
                      </View>
                    )}
                    {submission.is_paid && (
                      <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-yellow-700 mr-1">💰</Text>
                        <Text className="text-yellow-700 text-xs font-semibold">Paid</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-500 text-xs mb-3">
                    Submitted by: {submission.profiles?.username || 'Unknown'}
                  </Text>
                  <View className="flex-row">
                    <Button
                      title="Approve"
                      onPress={() => handleApproveSubmission(submission.id)}
                      className="flex-1 mr-2"
                    />
                    <Button
                      title="Reject"
                      onPress={() => handleRejectSubmission(submission.id)}
                      variant="danger"
                      className="flex-1 ml-2"
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 text-center py-8">
                No pending submissions
              </Text>
            )}
          </View>
        ) : activeTab === 'reports' ? (
          // Reports List
          <View className="p-4">
            {reports.length > 0 ? (
              reports.map((report: any) => (
                <View
                  key={report.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-lg font-bold text-gray-800 flex-1">
                      {report.toilets?.name || 'Unknown Toilet'}
                    </Text>
                    <View className="bg-red-100 px-2 py-1 rounded">
                      <Text className="text-red-600 text-xs font-semibold">
                        {report.issue_type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-600 text-sm mb-2">
                    {report.description}
                  </Text>
                  <Text className="text-gray-500 text-xs mb-3">
                    Reported by: {report.profiles?.username || 'Unknown'}
                  </Text>
                  <View className="flex-row">
                    <Button
                      title="Resolve"
                      onPress={() => handleResolveReport(report.id)}
                      className="flex-1 mr-2"
                    />
                    <Button
                      title="Dismiss"
                      onPress={() => handleDismissReport(report.id)}
                      variant="secondary"
                      className="flex-1 ml-2"
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 text-center py-8">
                No open reports
              </Text>
            )}
          </View>
        ) : (
          // Deletion Requests List
          <View className="p-4">
            {deletionRequests.length > 0 ? (
              deletionRequests.map((request) => {
                const requestDate = new Date(request.deletion_requested_at);
                const timeAgo = getTimeAgo(requestDate);
                
                return (
                  <View
                    key={request.id}
                    className="bg-white border border-red-200 rounded-lg p-4 mb-4"
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800 mb-1">
                          {request.username}
                        </Text>
                        {request.email ? (
                          <Text className="text-gray-600 text-sm mb-1">
                            {request.email}
                          </Text>
                        ) : null}
                        <Text className="text-gray-500 text-xs">
                          User ID: {request.id.substring(0, 8)}...
                        </Text>
                      </View>
                      <View className="bg-red-100 px-2 py-1 rounded">
                        <Text className="text-red-600 text-xs font-semibold">
                          PENDING
                        </Text>
                      </View>
                    </View>
                    <View className="mt-3 pt-3 border-t border-gray-200">
                      <Text className="text-gray-600 text-sm mb-1">
                        <Text className="font-semibold">Requested:</Text> {requestDate.toLocaleString()}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {timeAgo}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text className="text-gray-500 text-center py-8">
                No deletion requests
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return diffMins <= 0 ? 'Just now' : `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  }
};

