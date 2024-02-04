/**
* @Author        Himanshu sharma
* @Description ISS-000673  Utilize this class to retrieve field api names from a field set, fetch data, delete records, and save data.
*
*/
public with sharing class GenricLightningDatatableController {
    @AuraEnabled(cacheable=false)
    public static Response callBackend(String data,String objectApiName){
        try{
            List<sObject> objectList = new List<sObject>();
            List<Object> mainDataList = (List<Object>)JSON.deserializeUntyped(data);
            for(Object objInstanceOfMainData : mainDataList){
                Map<String,Object> fieldApiNameVsValue = (Map<String,Object>)JSON.deserializeUntyped(JSON.serialize(objInstanceOfMainData));
                Map<String, Object> attributes = new Map<String, Object>{
                    'type' => objectApiName
                        };
                            fieldApiNameVsValue.put('attributes', attributes);
                sObject sobj = (sObject) JSON.deserialize(JSON.serialize(fieldApiNameVsValue), sObject.class);
                objectList.add(sobj);
            }
            if(!objectList.isEmpty()){
                UPSERT as user objectList;
            }
            return (new Response('',true,new List<FieldData>(),new List<sObject>())); 
        }catch(exception ex){
            return (new Response(ex.getMessage(),false,new List<FieldData>(),new List<sObject>())); 
        }
    }
    @AuraEnabled(cacheable=false)
    public static Response getAllFieldApiName(String fieldSetName,String objectApiName){
        try{
            List<FieldData> fieldDataList = new List<FieldData>();
            List<String> fieldsForQuery = new List<String>();
            Map<String, Schema.SObjectType> GlobalDescribeMap = Schema.getGlobalDescribe();
            Schema.SObjectType SObjectTypeObj = GlobalDescribeMap.get(objectApiName);
            Schema.DescribeSObjectResult DescribeSObjectResultObj = SObjectTypeObj.getDescribe();
            Schema.FieldSet fieldSetObj = DescribeSObjectResultObj.FieldSets.getMap().get(fieldsetName);
            for(Schema.FieldSetMember fieldSetMemberObj : fieldSetObj.getFields()) {
                List<Options> optionList = new List<Options>();
                String refrenceFieldName = '';
                Schema.DescribeFieldResult fieldResult = DescribeSObjectResultObj.fields.getMap().get(String.valueOf(fieldSetMemberObj.getFieldPath())).getDescribe();
                if(String.valueOf(fieldSetMemberObj.getType()).toLowerCase() == 'reference'){
                    String fieldName = fieldSetMemberObj.getFieldPath().replace('__c', '__r.Name');
                    for(Schema.SObjectType reference : fieldResult.getReferenceTo()) {
                        refrenceFieldName = reference.getDescribe().getName();
                    }
                    fieldsForQuery.add(fieldName);
                }else if (String.valueOf(fieldSetMemberObj.getType()).toLowerCase() == 'picklist'){
                    List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
                    for(Schema.PicklistEntry f : ple)
                    {
                        optionList.add(new Options(f.getLabel(), f.getValue()));
                    }
                    fieldsForQuery.add(fieldSetMemberObj.getFieldPath());
                }
                else{
                    fieldsForQuery.add(fieldSetMemberObj.getFieldPath());
                }
                FieldData fieldDataInstance = new FieldData(fieldSetMemberObj.getFieldPath(),fieldSetMemberObj.getLabel(),String.valueOf(fieldSetMemberObj.getType()));
                fieldDataInstance.options = optionList;
                fieldDataInstance.refrenceFieldName = refrenceFieldName;
                fieldDataList.add(fieldDataInstance);
            }
            String query = 'SELECT '+ String.join(fieldsForQuery,',')+ ' FROM '+objectApiName;
            List<sObject> allData =  Database.query(query,AccessLevel.USER_MODE);
            return (new Response('',true,fieldDataList,allData)); 
            
        }catch(Exception ex){
            return (new Response(ex.getMessage(),false,new List<FieldData>(),new List<sObject>())); 
        }
    }
    @AuraEnabled(cacheable=false)
    public static Response deleteRecord(Id recordId){
        try{
            SObject recordToDelete = recordId.getSobjectType().newSObject(recordId);
            delete recordToDelete;
            return (new Response('',true,new List<FieldData>(),new List<Sobject>()));
        }catch(exception ex){
            return (new Response(ex.getMessage(),false,new List<FieldData>(),new List<Sobject>()));
        }
    }
    public class Response{
        @AuraEnabled
        public String message {get;set;}
        @AuraEnabled
        public Boolean isSuccess {get;set;}
        @AuraEnabled
        public List<FieldData> fieldData {get;set;}
        @AuraEnabled
        public List<SObject> data {get;set;}
        public Response(String messageP,Boolean isSuccessP,List<FieldData> fieldDataP,List<SObject> dataP){
            message = messageP;
            isSuccess = isSuccessP;
            fieldData = fieldDataP;
            data = dataP;
        }
    }
    public class FieldData{
        @AuraEnabled
        public String apiName {get;set;}
        @AuraEnabled
        public String label {get;set;}
        @AuraEnabled 
        public String dataType {get;set;}
        @AuraEnabled
        public List<Options> options {get;set;}
        @AuraEnabled
        public String refrenceFieldName {get;set;}
        public FieldData(String apiNameP,String labelP,String dataTypeP){
            apiName = apiNameP;
            label = labelP;
            dataType = dataTypeP;
        }
    }
    public class Options{
        @AuraEnabled 
        public String label {get;set;}
        @AuraEnabled
        public String value {get;set;}
        public Options(String labelP,String valueP){
            label = labelP;
            value = valueP;
        }
    }
}