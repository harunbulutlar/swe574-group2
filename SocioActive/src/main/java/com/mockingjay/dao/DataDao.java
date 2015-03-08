package com.mockingjay.dao;

/***
 * author edemirel 08.03.2015 
 * 
 */
import java.util.List;

import com.mockingjay.model.Employee;

public interface DataDao {

	public boolean addEntity(Employee employee) throws Exception;
	public Employee getEntityById(long id) throws Exception;
	public List<Employee> getEntityList() throws Exception;
	public boolean deleteEntity(long id) throws Exception;
}
